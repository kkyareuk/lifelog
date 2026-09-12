// Shared command definitions: local and multiplayer use the same activity IDs.
export const SOCIAL_ACTIVITIES={
 bother:{section:'conversation',labels:['귀찮게 굴기','Playfully bother','ちょっかいを出す'],lines:['장난스럽게 말을 걸고 있어요.','They playfully seek attention.','ふざけて気を引いています。']},
 message:{remote:true,labels:['문자 보내기','Send a message','メッセージを送る'],lines:['휴대폰으로 전할 말을 적어 보내고 있어요. 상대의 답장을 강요하지 않고 자기 자리에서 연락해요.','They type and send a message from where they are, without demanding a reply.','その場で伝えたいことを入力して送っています。返事は急かしません。']},
 remote_checkin:{remote:true,labels:['문자로 안부 묻기','Check in by message','メッセージで近況を聞く'],lines:['잘 지내는지 묻는 문자를 보내고 있어요. 상대가 확인할 때까지 하던 일을 이어 가요.','They send a message asking how the other person is doing, then continue their own day.','元気にしているかメッセージで尋ね、相手が確認するまで自分の用事を続けます。']},
 phone_call:{remote:true,labels:['전화 걸기','Make a call','電話をかける'],lines:['자기 자리에서 전화를 걸고 연결을 기다리고 있어요. 아직 상대가 받은 것은 아니에요.','They place a call from where they are and wait for an answer. The other person has not answered yet.','その場で電話をかけ、つながるのを待っています。相手はまだ出ていません。']},
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
Object.assign(SOCIAL_ACTIVITIES,{
  "small_discovery": {
    "section": "conversation",
    "contextual": true,
    "labels": [
      "작은 발견 이야기하기",
      "Share a small discovery",
      "小さな発見を話す"
    ],
    "lines": [
      "오늘 눈에 띈 작은 것을 하나 꺼내 이야기하며, 서로 무엇을 먼저 봤는지 비교하고 있어요.",
      "They share a small thing they noticed today and compare what caught each person’s eye.",
      "今日気づいた小さなことを話し、互いにどこが目に留まったか比べています。"
    ]
  },
  "ask_opinion": {
    "section": "conversation",
    "contextual": true,
    "labels": [
      "선택지 놓고 의견 묻기",
      "Compare choices",
      "選択肢について意見を聞く"
    ],
    "lines": [
      "망설이는 선택지를 하나씩 놓고 어떤 점이 마음에 걸리는지 이야기하고 있어요.",
      "They consider each option and explain what gives them pause.",
      "迷っている選択肢を一つずつ挙げ、何が気になるか話しています。"
    ]
  },
  "share_favorite": {
    "section": "conversation",
    "contextual": true,
    "labels": [
      "좋아하는 부분 소개하기",
      "Share a favorite detail",
      "好きなところを紹介する"
    ],
    "lines": [
      "좋아하는 것의 어느 부분이 좋은지 구체적으로 짚어 이야기하고 있어요.",
      "They point out exactly which details they like about a favorite thing.",
      "好きな物のどんなところが良いのか、具体的に挙げて話しています。"
    ]
  },
  "silly_question": {
    "section": "conversation",
    "contextual": true,
    "labels": [
      "엉뚱한 가정 이야기하기",
      "Discuss a playful what-if",
      "変わったもしも話をする"
    ],
    "lines": [
      "만약에 일어날 법한 엉뚱한 상황을 하나 정하고, 각자라면 어떻게 할지 이야기하고 있어요.",
      "They choose an unusual what-if and discuss how each of them would respond.",
      "変わったもしもの状況を一つ決め、自分ならどうするか話しています。"
    ]
  },
  "ask_memory": {
    "section": "conversation",
    "contextual": true,
    "labels": [
      "기억나는 장면 나누기",
      "Share a memory",
      "覚えている場面を話す"
    ],
    "lines": [
      "각자 기억에 남은 장면을 꺼내며, 같은 이야기에서도 다르게 기억한 부분을 짚고 있어요.",
      "They share scenes they remember and notice which details stand out differently.",
      "覚えている場面を話し、同じ話でも印象に残った点の違いを確かめています。"
    ]
  },
  "explain_interest": {
    "section": "conversation",
    "contextual": true,
    "labels": [
      "궁금한 것 함께 알아보기",
      "Explore a question together",
      "気になることを一緒に調べる"
    ],
    "lines": [
      "궁금한 점을 한 가지로 좁히고, 서로 아는 내용과 더 찾아볼 내용을 나누고 있어요.",
      "They narrow down a question and separate what they know from what they need to look up.",
      "疑問を一つに絞り、知っていることと調べたいことを分けています。"
    ]
  },
  "listen_story": {
    "section": "care",
    "contextual": true,
    "labels": [
      "말 끊지 않고 듣기",
      "Listen without interrupting",
      "話を遮らずに聞く"
    ],
    "lines": [
      "말이 잠시 멈춰도 결론을 대신 내리지 않고, 상대가 이어 말할 틈을 두고 있어요.",
      "They leave room for pauses instead of supplying a conclusion for the other person.",
      "言葉が止まっても結論を代わりに決めず、相手が続きを話せる間を残しています。"
    ]
  },
  "quiet_company": {
    "section": "care",
    "contextual": true,
    "labels": [
      "각자 할 일 하며 곁에 있기",
      "Keep quiet company",
      "それぞれのことをしてそばにいる"
    ],
    "lines": [
      "각자 하던 일을 이어 가며 같은 공간에 머물러 있어요. 말을 계속해야 한다고 재촉하지 않아요.",
      "They continue their own activities in the same space without pushing for conversation.",
      "同じ場所でそれぞれのことを続け、話し続けるようには急かしません。"
    ]
  },
  "offer_help": {
    "section": "care",
    "contextual": true,
    "labels": [
      "작은 일 도와주겠다고 묻기",
      "Offer help with a small task",
      "小さな手伝いを申し出る"
    ],
    "lines": [
      "지금 손을 보탤 일이 있는지 먼저 묻고, 상대가 원하는 도움의 범위를 확인하고 있어요.",
      "They ask whether help is wanted and check what kind of help would be useful.",
      "手を貸せることがあるか先に聞き、相手が望む手伝いの範囲を確かめています。"
    ]
  },
  "thank_detail": {
    "section": "care",
    "contextual": true,
    "labels": [
      "고마웠던 행동 짚어 말하기",
      "Thank them for a specific act",
      "具体的な行動にお礼を言う"
    ],
    "lines": [
      "고마움을 전하고 싶은 행동을 한 가지 짚어, 어떤 점이 도움이 되었는지 설명하고 있어요.",
      "They identify one action they appreciate and explain how it helped.",
      "感謝したい行動を一つ挙げ、どんな点が助けになったか伝えています。"
    ]
  },
  "clarify_words": {
    "section": "care",
    "contextual": true,
    "labels": [
      "말의 뜻 차분히 확인하기",
      "Clarify what was meant",
      "言葉の意味を落ち着いて確かめる"
    ],
    "lines": [
      "같은 말을 다르게 이해한 부분이 있는지 묻고, 추측보다 설명을 먼저 듣고 있어요.",
      "They check whether a phrase was understood differently and listen before making assumptions.",
      "同じ言葉を違って受け取った部分がないか尋ね、推測より先に説明を聞いています。"
    ]
  },
  "take_pause": {
    "section": "care",
    "contextual": true,
    "labels": [
      "잠깐 쉬었다 이야기하기",
      "Take a pause before talking",
      "少し休んでから話す"
    ],
    "lines": [
      "지금 바로 답을 정하지 않고 잠시 쉬어 가며, 다시 이야기할 여유를 만들고 있어요.",
      "They pause instead of deciding immediately and make room to return to the conversation.",
      "すぐに答えを出さず少し休み、また話せる余裕を作っています。"
    ]
  },
  "puzzle_together": {
    "section": "together",
    "contextual": true,
    "labels": [
      "퍼즐 조각 같이 찾기",
      "Find puzzle pieces together",
      "一緒にパズルのピースを探す"
    ],
    "lines": [
      "한쪽은 색을, 다른 쪽은 모양을 살피며 맞을 만한 조각을 가운데 모으고 있어요.",
      "One checks colors while the other checks shapes, collecting promising pieces between them.",
      "一人は色、もう一人は形を見て、合いそうなピースを間に集めています。"
    ]
  },
  "playlist_together": {
    "section": "together",
    "contextual": true,
    "labels": [
      "한 곡씩 번갈아 고르기",
      "Take turns choosing songs",
      "一曲ずつ交代で選ぶ"
    ],
    "lines": [
      "한 곡씩 번갈아 고르며, 방금 들은 곡에서 눈에 띈 소리나 대목을 이야기하고 있어요.",
      "They take turns picking songs and point out sounds or passages they noticed.",
      "一曲ずつ交代で選び、聴いた曲で気づいた音や部分について話しています。"
    ]
  },
  "drawing_together": {
    "section": "together",
    "contextual": true,
    "labels": [
      "같은 물건 각자 그리기",
      "Draw the same object",
      "同じ物をそれぞれ描く"
    ],
    "lines": [
      "같은 물건을 보고 각자 그린 뒤, 서로 다르게 잡은 모양과 강조한 부분을 비교하고 있어요.",
      "They draw the same object and compare the shapes and details each emphasized.",
      "同じ物をそれぞれ描き、形の捉え方や強調した部分を比べています。"
    ]
  },
  "tidy_together": {
    "section": "together",
    "contextual": true,
    "labels": [
      "작은 공간 함께 정리하기",
      "Tidy a small space together",
      "小さな場所を一緒に片づける"
    ],
    "lines": [
      "함께 쓰는 작은 공간부터 고르고, 자주 쓰는 물건을 어디에 둘지 의논하고 있어요.",
      "They choose a small shared space and discuss where frequently used things should go.",
      "一緒に使う小さな場所を選び、よく使う物をどこに置くか相談しています。"
    ]
  },
  "plan_outing": {
    "section": "together",
    "contextual": true,
    "labels": [
      "다음 외출 계획 세우기",
      "Plan a future outing",
      "次の外出を計画する"
    ],
    "lines": [
      "가 보고 싶은 곳을 하나씩 꺼내고, 이동 시간과 쉬어 갈 곳을 함께 살펴보고 있어요.",
      "They suggest places to visit and check travel times and places to rest.",
      "行きたい場所を一つずつ挙げ、移動時間と休める所を一緒に調べています。"
    ]
  },
  "word_game": {
    "section": "together",
    "contextual": true,
    "labels": [
      "가벼운 말놀이하기",
      "Play a word game",
      "軽い言葉遊びをする"
    ],
    "lines": [
      "차례를 정해 떠오르는 말을 이어 가며, 막히면 힌트를 줄지 규칙을 다시 정하고 있어요.",
      "They take turns adding words and decide whether to offer hints when someone gets stuck.",
      "順番に言葉をつなぎ、詰まった時にヒントを出すかルールを相談しています。"
    ]
  }
});
const socialReceiverLines={
 listen_story:['말을 끊지 않고 기다려 주는 상대 앞에서, 어디까지 이야기할지 자기 속도로 정하고 있어요.','With the other person leaving room to speak, they decide how much to share at their own pace.','話を遮らず待つ相手の前で、どこまで話すか自分のペースで決めています。'],
 offer_help:['도와주겠다는 말을 듣고, 필요한 부분이 있는지 살피고 있어요. 아직 도움을 받기로 정한 것은 아니에요.','They consider the offer and whether any help is needed; they have not accepted yet.','手伝いの申し出を聞き、必要なことがあるか考えています。まだ受けると決めたわけではありません。'],
 thank_detail:['어떤 행동이 도움이 됐는지 들으며, 상대가 고마워한 부분을 확인하고 있어요.','They listen to which action helped and consider what the other person appreciated.','どの行動が助けになったかを聞き、相手が感謝した点を確かめています。']
};
export function socialActivityCopy(kind,actor,target,topic='',options={}){
 const item=SOCIAL_ACTIVITIES[kind];if(!item)return null;
 if(['taunt','insult'].includes(kind)&&options.initiatorId&&actor.id!==options.initiatorId){
  const calm=/느긋|무심|차분/.test([actor.conflictStyle,actor.energyRhythm,...(actor.personalityTypes||[])].join(' '));
  const lines=calm?['불쾌한 말을 듣고도 대꾸하지 않고 흘려넘겼어요.','They let the unpleasant remark pass without responding.','不快な言葉にも返事をせず、受け流しました。']:['불쾌한 표정으로 그런 말은 하지 말라며 맞섰어요.','They look upset and tell the other person to stop.','不快な表情で、そんなことを言わないよう言い返しました。'];
  return Object.fromEntries(['ko','en','ja'].map((lang,i)=>[lang,{title:[`${target.name}의 날 선 말에 반응하는 중`,`Responding to ${target.name}’s cutting remark`,`${target.name}の刺々しい言葉に反応するところ`][i],desc:lines[i]}]));
 }
 const detail=String(topic).trim().slice(0,120),other=String(target?.name||'');
 const receiving=options.initiatorId&&options.initiatorId!==actor.id&&socialReceiverLines[kind];
 const receiverTitles={listen_story:[`${other}에게 자기 이야기를 하는 중`,`Sharing their story with ${other}`,`${other}に自分の話をするところ`],offer_help:[`${other}의 도움 제안을 듣는 중`,`Considering ${other}'s offer of help`,`${other}の手伝いの申し出を聞くところ`],thank_detail:[`${other}의 고마움을 듣는 중`,`Hearing ${other}'s thanks`,`${other}のお礼を聞くところ`]};
 const socialFood=['dine','tea','drinks','cook_together'].includes(kind);
 const controlling=c=>/완고|통제/.test([...(c.personalityTypes||[]),c.interference].join(' '))&&!/다정/.test((c.personalityTypes||[]).join(' '));
 const critic=controlling(actor)?actor:controlling(target)?target:null;
 const older=critic?.ageGroup==='노인';
 const extra=socialFood&&critic?[`${critic.name}${older?'은 경험을 내세워 생활 방식까지 훈수를 두고 있어요.':'은 사소한 방식까지 지적하며 자기 뜻대로 하려 해요.'}`,`${critic.name} ${older?'uses their experience to lecture about life.':'criticizes small details and tries to take control.'}`,`${critic.name}は${older?'経験を持ち出して暮らし方に口を出しています。':'細かいやり方を指摘し、自分の思い通りにしようとしています。'}`]:['','',''];
 const bill=socialPaymentCopy(kind,actor,options);
 return Object.fromEntries(['ko','en','ja'].map((lang,i)=>[lang,{title:receiving?receiverTitles[kind][i]:[item.remote?`${other}에게 ${item.labels[0]}`:`${other}와 ${item.labels[0].replace(/하기$/,'하는 중')}`,`${item.labels[1]} · ${other}`,`${other}と${item.labels[2]}`][i],desc:[options.initiatorId&&options.initiatorId!==actor.id&&socialReceiverLines[kind]?socialReceiverLines[kind][i]:item.lines[i],extra[i],bill[i]].filter(Boolean).join(' ')+(detail?[' 함께 정한 주제: ',' Chosen topic: ',' テーマ：'][i]+detail:'')}]))
}

export function socialPaymentCopy(kind,actor,options={}){
 const payment=options.payment||'split',payer=options.payerName||actor?.name||'';
 return !['dine','tea','drinks'].includes(kind)?['','','']:payment==='treat'?[`${payer}이 계산을 맡기로 했어요.`,`${payer} offered to pay.`,`${payer}が支払いを引き受けました。`]:payment==='request'?[`${payer}에게 사 달라고 부탁했어요. 아직 동의한 것은 아니에요.`,`${payer} was asked to pay; they have not agreed yet.`,`${payer}におごってほしいと頼みました。まだ同意はしていません。`]:['각자 계산하기로 했어요.','They agreed to pay separately.','各自で支払うことにしました。'];
}

export const ROMANTIC_ACTIVITIES=['kiss','kiss_cautious','kiss_reconcile','affection'];
export function hasRomanticRelationship(relationships,a,b){return Object.values(relationships||{}).some(r=>r&&r.temporalStatus!=='past'&&((r.a===a&&r.b===b)||(r.a===b&&r.b===a))&&['연인','부부','약혼','약혼자','커플','폴리 관계'].includes(r.type));}

export const SOCIAL_SECTIONS=[
 {id:'friendly',labels:['친근한 활동','Friendly activities','親しい交流'],actions:['talk','debate','gossip','custom_social','hangout','comfort','compliment','dine','tea','drinks','cook_together','play_together','study_together','read_together','compete']},
 {id:'conflict',labels:['갈등','Conflict','対立'],actions:['taunt','insult','argue','fight']},
 {id:'romance',labels:['애정 표현','Affection','愛情表現'],actions:['hug','handhold','lean','kiss','affection']}
];

export function workTasks(character){
 const job=String(character?.jobTitle||character?.job||'');
 const tasks=/의사|간호|의료|병원/.test(job)?[['consult','진료·상담하기','See patients','診察・相談'],['chart','진료 기록 정리하기','Update medical records','診療記録の整理']]:/교사|교수|강사/.test(job)?[['lesson','수업 준비하기','Prepare lessons','授業の準備'],['teach','수업하기','Teach a class','授業をする']]:/요리|조리|셰프/.test(job)?[['prep','식재료 준비하기','Prepare ingredients','食材の準備'],['kitchen','주방 업무하기','Work in the kitchen','厨房で働く']]:/연구|과학/.test(job)?[['experiment','연구·실험하기','Research and experiments','研究・実験'],['results','연구 결과 정리하기','Review research results','研究結果の整理']]:/작가|화가|예술|음악|배우/.test(job)?[['create','작품 작업하기','Work on a piece','作品づくり'],['practice','연습·퇴고하기','Practice and revise','練習・推敲']]:/학생/.test(job)?[['assignment','과제하기','Do assignments','課題に取り組む'],['revision','수업 복습하기','Review lessons','授業の復習']]:/무직|없음|설정하지/.test(job)||!job?[['career','진로 알아보기','Explore careers','進路を調べる']]:[['tasks','담당 업무 처리하기','Handle work tasks','担当業務を進める'],['plan','업무 계획 세우기','Plan work','仕事の計画'],['report','업무 기록 정리하기','Organize work records','業務記録の整理']];
 return tasks.map(([id,...labels])=>({id,labels}));
}
