export const SPEECH_STYLE_OPTIONS=Object.freeze([
  "자동 · 성격에 맞춤",
  "반말",
  "했다체 · 건조한 서술",
  "존댓말 · 해요체",
  "격식 있는 존댓말 · 하십시오체",
  "극존칭",
  "무뚝뚝한 단답",
  "기계적인 말투",
  "사무적인 말투 · 직장 메일체",
  "판교어 · 스타트업 업무체",
  "다정하고 부드러운 말투",
  "상냥하고 배려하는 말투",
  "소심하고 머뭇거리는 말투",
  "열정적인 말투",
  "능글맞고 여유로운 말투",
  "냉소적인 말투",
  "걸걸한 아저씨 말투",
  "거칠고 상스러운 말투 · 순화",
  "중2병 말투",
  "귀여니체 · 2000년대 인터넷소설체",
  "하드보일드 누아르체",
  "고풍스러운 말투",
  "사극 선비 말투",
  "군인식 말투",
  "마왕의 말투",
  "군주의 말투",
  "신탁을 내리는 신의 말투",
  "옛날 번역기체",
  "귀엽고 애교 있는 말투",
  "수다스럽고 말이 많은 말투"
]);

export function effectiveSpeechStyle(character){
  const selected=character?.speechStyle||SPEECH_STYLE_OPTIONS[0];
  if(selected!==SPEECH_STYLE_OPTIONS[0])return selected;
  const traits=character?.personalityTypes||[];
  if(traits.includes("수줍고 내향적"))return "소심하고 머뭇거리는 말투";
  if(traits.includes("다정하고 세심함"))return "상냥하고 배려하는 말투";
  if(traits.includes("활발하고 사교적"))return "열정적인 말투";
  if(traits.includes("냉정하고 논리적"))return "사무적인 말투 · 직장 메일체";
  if(traits.includes("무심하고 독립적"))return "무뚝뚝한 단답";
  if(traits.includes("장난기 많음"))return "능글맞고 여유로운 말투";
  return "존댓말 · 해요체";
}

function questionSubject(kind,target,language){
  if(language==="en")return kind==="weekend"?"this weekend's plan":kind==="work"?"the next work priority":kind==="gift"?`a gift for ${target||"them"}`:"today's free-time plan";
  if(language==="ja")return kind==="weekend"?"今週末の予定":kind==="work"?"次の仕事の優先順位":kind==="gift"?`${target||"相手"}へのプレゼント`:"今日の空き時間の予定";
  return kind==="weekend"?"이번 주말 일정":kind==="work"?"다음 업무 우선순위":kind==="gift"?`${target||"상대"}의 선물`:"오늘 남는 시간의 일정";
}

export function characterQuestionPrompt(character,{kind="everyday",target="",language="ko",base=""}={}){
  const style=effectiveSpeechStyle(character),subject=questionSubject(kind,target,language);
  if(language==="en"){
    const lines={
      "무뚝뚝한 단답":`${subject}. Pick one.`,"기계적인 말투":`INPUT REQUIRED: select ${subject}.`,"사무적인 말투 · 직장 메일체":`Please reply with your preferred option regarding ${subject}.`,"판교어 · 스타트업 업무체":`Could we align on the action item for ${subject}?`,"소심하고 머뭇거리는 말투":`Um… if it's okay, could you choose ${subject}?`,"열정적인 말투":`Let's make ${subject} amazing! What should we pick?`,"중2병 말투":`The seal is weakening. Choose the destiny of ${subject}.`,"하드보일드 누아르체":`${subject}. In this town, a choice always leaves a mark.`,"마왕의 말투":`Mortal, choose the fate of ${subject}.`,"군주의 말투":`Declare your decision regarding ${subject}.`,"신탁을 내리는 신의 말투":`Choose, and the path of ${subject} shall be revealed.`,"옛날 번역기체":`It is necessary that you select the action of ${subject}.`,"귀엽고 애교 있는 말투":`Can you pick ${subject} for me, pretty please?`
    };
    return lines[style]||base;
  }
  if(language==="ja"){
    const lines={
      "무뚝뚝한 단답":`${subject}。選んで。`,"기계적인 말투":`入力待機中。${subject}を選択してください。`,"사무적인 말투 · 직장 메일체":`${subject}につきまして、ご希望をご回答ください。`,"판교어 · 스타트업 업무체":`${subject}のアクションについて認識を合わせさせてください。`,"소심하고 머뭇거리는 말투":`あの……よければ、${subject}を選んでもらえますか？`,"열정적인 말투":`${subject}、最高の選択にしよう！ 何がいい？`,"중2병 말투":`封印が弱まっている……${subject}の運命を選べ。`,"하드보일드 누아르체":`${subject}か。この街では、選択にはいつも跡が残る。`,"마왕의 말투":`人の子よ、${subject}の運命を選ぶがよい。`,"군주의 말투":`${subject}について、そなたの決断を申せ。`,"신탁을 내리는 신의 말투":`選びなさい。さすれば${subject}の道は開かれる。`,"옛날 번역기체":`あなたは${subject}の行動を選択することが必要です。`,"귀엽고 애교 있는 말투":`${subject}、選んでほしいな～。だめ？`
    };
    return lines[style]||base;
  }
  const lines={
    "반말":`${subject}, 뭐가 좋을까?`,
    "했다체 · 건조한 서술":`${subject}을 정할 때가 됐다. 선택이 필요했다.`,
    "존댓말 · 해요체":base,
    "격식 있는 존댓말 · 하십시오체":`${subject}에 관해 선택해 주시겠습니까?`,
    "극존칭":`부디 ${subject}을 하명하여 주시겠사옵니까?`,
    "무뚝뚝한 단답":`${subject}. 골라.`,
    "기계적인 말투":`선택 입력 대기 중. ${subject}을 지정하십시오.`,
    "사무적인 말투 · 직장 메일체":`${subject} 관련하여 선호하시는 안으로 회신 부탁드립니다.`,
    "판교어 · 스타트업 업무체":`${subject} 액션 아이템, 어떤 안으로 얼라인하면 될까요?`,
    "다정하고 부드러운 말투":`${subject}, 우리 천천히 같이 골라 볼까요?`,
    "상냥하고 배려하는 말투":`부담되지 않는다면 ${subject}을 골라 주실래요? 무엇이든 괜찮아요.`,
    "소심하고 머뭇거리는 말투":`저기… 괜찮다면 ${subject}, 골라 줄 수 있을까요?`,
    "열정적인 말투":`${subject}, 멋지게 정해 봐요! 어떤 게 좋을까요?`,
    "능글맞고 여유로운 말투":`${subject} 말이지? 당신이라면 재밌는 걸 고를 것 같은데.`,
    "냉소적인 말투":`${subject}이라. 뭘 고르든 세상은 굴러가겠지만, 일단 골라 봐.`,
    "걸걸한 아저씨 말투":`${subject} 말이야, 뭐가 좋겠어? 시원하게 하나 골라 보자고.`,
    "거칠고 상스러운 말투 · 순화":`${subject}, 답답하게 굴지 말고 확 골라 보자고.`,
    "중2병 말투":`봉인이 느슨해지고 있다… ${subject}의 운명을 네 손으로 선택하라.`,
    "귀여니체 · 2000년대 인터넷소설체":`${subject} 머할까아…? 나 진짜 못 고르겠눈뎅 ㅠ_ㅠ`,
    "하드보일드 누아르체":`${subject}이라… 이 도시에서는 선택 하나에도 흔적이 남지.`,
    "고풍스러운 말투":`${subject}을 어찌 정하면 좋겠는가? 그대의 뜻을 들려주게.`,
    "사극 선비 말투":`${subject}에 관한 그대의 고견을 청해도 되겠소?`,
    "군인식 말투":`${subject} 결정을 요청합니다. 지시해 주십시오.`,
    "마왕의 말투":`필멸자여, ${subject}의 향방을 정하라.`,
    "군주의 말투":`${subject}에 관한 그대의 뜻을 고하라.`,
    "신탁을 내리는 신의 말투":`선택하라. 그러면 ${subject}의 길이 열릴지니.`,
    "옛날 번역기체":`당신은 ${subject}의 행동을 선택하는 것이 필요합니다.`,
    "귀엽고 애교 있는 말투":`${subject}, 나 대신 골라 주면 안 돼요오?`,
    "수다스럽고 말이 많은 말투":`${subject}을 정해야 하는데 이것도 좋고 저것도 좋아 보여서 말이죠, 당신은 어떤 게 제일 좋다고 생각해요?`
  };
  return lines[style]||base;
}

// 연락 알림은 캐릭터가 직접 보내는 문장이다. 질문 전용 문장을 억지로
// 재사용하지 않고, 같은 원문을 각 캐릭터의 말버릇으로 짧게 다듬는다.
// 생활로그 알림은 관찰 기록이므로 호출부에서 이 변환을 사용하지 않는다.
function koreanCasual(value){
  return value
    .replace(/하실래요\?/g,"할래?").replace(/해 줄래요\?/g,"해 줄래?").replace(/해 주세요/g,"해 줘")
    .replace(/괜찮아요/g,"괜찮아").replace(/돼요/g,"돼").replace(/있어요/g,"있어").replace(/없어요/g,"없어")
    .replace(/이에요/g,"이야").replace(/예요/g,"야").replace(/했어요/g,"했어").replace(/해요/g,"해")
    .replace(/나요\?/g,"나?").replace(/까요\?/g,"까?").replace(/요([.!?]|$)/g,"$1");
}

function koreanPlain(value){
  return value
    .replace(/당신/g,"그대").replace(/해 주세요/g,"해 달라").replace(/쉬어요/g,"쉰다")
    .replace(/지 않아도 돼요/g,"지 않아도 된다").replace(/수 있어요/g,"수 있다").replace(/고 있어요/g,"고 있다")
    .replace(/중이에요/g,"중이다").replace(/괜찮아요/g,"괜찮다").replace(/편안해요/g,"편안하다").replace(/분명해요/g,"분명하다")
    .replace(/있어요/g,"있다").replace(/없어요/g,"없다").replace(/돼요/g,"된다").replace(/이에요/g,"이다").replace(/예요/g,"이다")
    .replace(/했어요/g,"했다").replace(/였어요/g,"였다").replace(/려고요/g,"려 한다").replace(/네요/g,"는군")
    .replace(/해요/g,"한다").replace(/나요\?/g,"느냐?").replace(/까요\?/g,"겠느냐?").replace(/요([.!?]|$)/g,"$1");
}

function koreanFormal(value){
  return value
    .replace(/해 주세요/g,"해 주십시오").replace(/괜찮아요/g,"괜찮습니다").replace(/돼요/g,"됩니다")
    .replace(/있어요/g,"있습니다").replace(/없어요/g,"없습니다").replace(/이에요/g,"입니다").replace(/예요/g,"입니다")
    .replace(/했어요/g,"했습니다").replace(/해요/g,"합니다").replace(/나요\?/g,"습니까?").replace(/까요\?/g,"겠습니까?");
}

function koreanSovereign(value){
  return koreanPlain(value)
    .replace(/숨부터 천천히 쉰다/g,"먼저 숨을 천천히 고르라")
    .replace(/같이 골라/g,"함께 고르라").replace(/골라\./g,"고르라.").replace(/말해 볼까\?/g,"말해 보겠느냐?");
}

const CONTACT_TITLES={
  ko:{
    "반말":"잠깐 얘기할래?","했다체 · 건조한 서술":"전언이 도착했다","존댓말 · 해요체":null,"격식 있는 존댓말 · 하십시오체":"전해 드릴 말씀이 있습니다","극존칭":"삼가 말씀을 올리옵니다","무뚝뚝한 단답":"할 말.","기계적인 말투":"상태 메시지 수신","사무적인 말투 · 직장 메일체":"간단 공유드립니다","판교어 · 스타트업 업무체":"빠른 체크인","다정하고 부드러운 말투":"조용히 전하고 싶은 말","상냥하고 배려하는 말투":"천천히 읽어도 괜찮아요","소심하고 머뭇거리는 말투":"저기… 잠깐 괜찮을까요?","열정적인 말투":"지금 꼭 전하고 싶어요!","능글맞고 여유로운 말투":"뭐, 잠깐 들어 봐","냉소적인 말투":"별수 없이 전하는 말","걸걸한 아저씨 말투":"어이, 잠깐 보자고","거칠고 상스러운 말투 · 순화":"야, 잠깐 들어 봐","중2병 말투":"봉인 너머의 전언","귀여니체 · 2000년대 인터넷소설체":"갑자기 니 생각나쏘…","하드보일드 누아르체":"도시에 남은 짧은 전언","고풍스러운 말투":"그대에게 띄우는 말","사극 선비 말투":"그대에게 청할 말이 있소","군인식 말투":"연락 사항 보고","마왕의 말투":"필멸자에게 내리는 전언","군주의 말투":"그대에게 고하는 말","신탁을 내리는 신의 말투":"오늘의 신탁","옛날 번역기체":"연락의 메시지가 도착했습니다","귀엽고 애교 있는 말투":"나한테 잠깐만 와 주라아","수다스럽고 말이 많은 말투":"별일은 아니고 잠깐 할 말이 있어요"
  },
  en:{
    "반말":"Hey, got a minute?","했다체 · 건조한 서술":"A message arrived","존댓말 · 해요체":null,"격식 있는 존댓말 · 하십시오체":"A message for your attention","극존칭":"A humble message","무뚝뚝한 단답":"Listen.","기계적인 말투":"STATUS MESSAGE","사무적인 말투 · 직장 메일체":"Quick update","판교어 · 스타트업 업무체":"Quick check-in","다정하고 부드러운 말투":"A gentle note","상냥하고 배려하는 말투":"Read this when you're ready","소심하고 머뭇거리는 말투":"Um… may I say something?","열정적인 말투":"I have to tell you this!","능글맞고 여유로운 말투":"Well, hear me out","냉소적인 말투":"A message, for what it's worth","걸걸한 아저씨 말투":"Hey, listen up","거칠고 상스러운 말투 · 순화":"Hey. Listen.","중2병 말투":"A message beyond the seal","귀여니체 · 2000년대 인터넷소설체":"i suddenly thought of u…","하드보일드 누아르체":"A note left in the city","고풍스러운 말투":"A letter for thee","사극 선비 말투":"A word for you","군인식 말투":"CONTACT REPORT","마왕의 말투":"A decree for the mortal","군주의 말투":"A royal message","신탁을 내리는 신의 말투":"Today's oracle","옛날 번역기체":"The contact message has arrived","귀엽고 애교 있는 말투":"Come talk to meee","수다스럽고 말이 많은 말투":"It's nothing urgent, but I wanted to talk"
  },
  ja:{
    "반말":"ちょっと話さない？","했다체 · 건조한 서술":"伝言が届いた","존댓말 · 해요체":null,"격식 있는 존댓말 · 하십시오체":"お伝えしたいことがあります","극존칭":"謹んで申し上げます","무뚝뚝한 단답":"話がある。","기계적인 말투":"状態メッセージ受信","사무적인 말투 · 직장 메일체":"簡単に共有いたします","판교어 · 스타트업 업무체":"クイックチェックイン","다정하고 부드러운 말투":"そっと伝えたいこと","상냥하고 배려하는 말투":"ゆっくり読んでください","소심하고 머뭇거리는 말투":"あの……少しいいですか？","열정적인 말투":"今すぐ伝えたい！","능글맞고 여유로운 말투":"まあ、ちょっと聞いて","냉소적인 말투":"一応、伝えておく","걸걸한 아저씨 말투":"おい、ちょっと聞け","거칠고 상스러운 말투 · 순화":"おい、聞いてくれ","중2병 말투":"封印の彼方からの伝言","귀여니체 · 2000년대 인터넷소설체":"急にキミを思い出したょ…","하드보일드 누아르체":"街に残された短い伝言","고풍스러운 말투":"そなたへ送る言葉","사극 선비 말투":"そなたに尋ねたいことがある","군인식 말투":"連絡事項報告","마왕의 말투":"人の子への勅命","군주의 말투":"王よりの言葉","신탁을 내리는 신의 말투":"今日の神託","옛날 번역기체":"連絡のメッセージが到着しました","귀엽고 애교 있는 말투":"ちょっと来てほしいな～","수다스럽고 말이 많은 말투":"急ぎじゃないけど少し話したくて"
  }
};

export function characterContactTitle(character,base,{language="ko"}={}){
  const text=String(base||"").trim(),style=effectiveSpeechStyle(character),localized=CONTACT_TITLES[language]||CONTACT_TITLES.ko;
  if(!text)return text;
  if(style==="반말"&&language==="ko")return koreanCasual(text);
  return localized[style]||text;
}

export function characterContactSpeech(character,base,{language="ko"}={}){
  const text=String(base||"").trim(),style=effectiveSpeechStyle(character);
  if(!text)return text;
  if(language==="en"){
    const wrappers={
      "반말":value=>`Hey—${value}`,"했다체 · 건조한 서술":value=>`A message was sent. ${value}`,"존댓말 · 해요체":value=>value,"격식 있는 존댓말 · 하십시오체":value=>`Please note: ${value}`,"극존칭":value=>`With the utmost respect, please receive these words: ${value}`,"무뚝뚝한 단답":value=>`Briefly: ${value.replace(/\bI am\b/g,"I'm").replace(/\bI have\b/g,"I've")}`,"기계적인 말투":value=>`STATUS MESSAGE: ${value}`,"사무적인 말투 · 직장 메일체":value=>`Quick update: ${value}`,"판교어 · 스타트업 업무체":value=>`A quick check-in—${value}`,"다정하고 부드러운 말투":value=>`I thought of you, so I wanted to say this gently: ${value}`,"상냥하고 배려하는 말투":value=>`There's no need to hurry. ${value}`,"소심하고 머뭇거리는 말투":value=>`Um… sorry to message out of nowhere. ${value}`,"열정적인 말투":value=>`Hey! ${value}`,"능글맞고 여유로운 말투":value=>`No rush, but hear me out. ${value}`,"냉소적인 말투":value=>`The world won't answer for us, so here it is. ${value}`,"걸걸한 아저씨 말투":value=>`Hey, let's talk this through. ${value}`,"거칠고 상스러운 말투 · 순화":value=>`Look, no need to overcomplicate it. ${value}`,"중2병 말투":value=>`A message crossed the sealed boundary: ${value}`,"귀여니체 · 2000년대 인터넷소설체":value=>`hey… i suddenly thought of u T_T ${value}`,"하드보일드 누아르체":value=>`${value} That's how the day goes in this town.`,"고풍스러운 말투":value=>`My thoughts turned to thee. ${value}`,"사극 선비 말투":value=>`May I ask for thy counsel? ${value}`,"군인식 말투":value=>`Contact report. ${value}`,"마왕의 말투":value=>`Mortal, heed my decree. ${value}`,"군주의 말투":value=>`Hear the words of your sovereign. ${value}`,"신탁을 내리는 신의 말투":value=>`Receive this oracle. ${value}`,"옛날 번역기체":value=>`It is informed to you that ${value.charAt(0).toLowerCase()}${value.slice(1)}`,"귀엽고 애교 있는 말투":value=>`${value} Tell me, pleeease?`,"수다스럽고 말이 많은 말투":value=>`It's nothing urgent, and I was just thinking of you, but ${value}`
    };
    return (wrappers[style]||((value)=>value))(text);
  }
  if(language==="ja"){
    const wrappers={
      "반말":value=>`ねえ、${value.replace(/です。/g,"だよ。").replace(/ます。/g,"るよ。")}`,"했다체 · 건조한 서술":value=>`連絡することになった。${value}`,"존댓말 · 해요체":value=>value,"격식 있는 존댓말 · 하십시오체":value=>`お伝えいたします。${value}`,"극존칭":value=>`恐れながら申し上げます。${value}`,"무뚝뚝한 단답":value=>`簡潔に。${value.replace(/です。$/,"。")}`,"기계적인 말투":value=>`状態報告。${value}`,"사무적인 말투 · 직장 메일체":value=>`取り急ぎ共有いたします。${value}`,"판교어 · 스타트업 업무체":value=>`簡単に認識を合わせたいです。${value}`,"다정하고 부드러운 말투":value=>`ふと思い出して、そっと伝えたくなりました。${value}`,"상냥하고 배려하는 말투":value=>`急がなくても大丈夫です。${value}`,"소심하고 머뭇거리는 말투":value=>`あの……急に連絡してすみません。${value}`,"열정적인 말투":value=>`ねえ！ ${value}`,"능글맞고 여유로운 말투":value=>`まあ、急ぎじゃないけどね。${value}`,"냉소적인 말투":value=>`世界が代わりに答えてくれるわけでもない。${value}`,"걸걸한 아저씨 말투":value=>`おい、ちょっと話そうじゃないか。${value}`,"거칠고 상스러운 말투 · 순화":value=>`ああ、難しく考えずに聞け。${value}`,"중2병 말투":value=>`封印の向こうから告げよう……${value}`,"귀여니체 · 2000년대 인터넷소설체":value=>`ねぇ…急にキミを思い出したょ T_T ${value}`,"하드보일드 누아르체":value=>`${value} そういう日もある。`,"고풍스러운 말투":value=>`ふと、そなたを思い出した。${value}`,"사극 선비 말투":value=>`そなたの考えを聞かせてもらいたい。${value}`,"군인식 말투":value=>`連絡事項を報告する。${value}`,"마왕의 말투":value=>`人の子よ、我が命を聞け。${value.replace(/あなた/g,"そなた")}`,"군주의 말투":value=>`余の言葉を聞け。${value.replace(/あなた/g,"そなた")}`,"신탁을 내리는 신의 말투":value=>`この神託を受け取りなさい。${value}`,"옛날 번역기체":value=>`あなたへ次のことが通知されます。${value}`,"귀엽고 애교 있는 말투":value=>`${value} 答えてほしいな～。`,"수다스럽고 말이 많은 말투":value=>`別に急ぎじゃなくて、ちょっと思い出しただけなんですけど、${value}`
    };
    return (wrappers[style]||((value)=>value))(text);
  }
  const wrappers={
    "반말":value=>koreanCasual(value),
    "했다체 · 건조한 서술":value=>`연락할 일이 생겼다. ${koreanPlain(value)}`,
    "존댓말 · 해요체":value=>value,
    "격식 있는 존댓말 · 하십시오체":value=>`잠시 말씀드리겠습니다. ${koreanFormal(value)}`,
    "극존칭":value=>`감히 말씀 올리옵니다. ${koreanFormal(value).replace(/습니다/g,"사옵니다").replace(/십시오/g,"시옵소서")}`,
    "무뚝뚝한 단답":value=>koreanCasual(value).replace(/, /g,". "),
    "기계적인 말투":value=>`상태 메시지 전송. ${koreanPlain(value)}`,
    "사무적인 말투 · 직장 메일체":value=>`안녕하세요. 아래와 같이 짧게 공유드립니다. ${koreanFormal(value)}`,
    "판교어 · 스타트업 업무체":value=>`가볍게 체크인드려요. 아래 내용으로 얼라인 부탁드려요. ${value}`,
    "다정하고 부드러운 말투":value=>`문득 생각나서 조용히 연락해요. ${value}`,
    "상냥하고 배려하는 말투":value=>`답을 서두르지 않아도 괜찮아요. ${value}`,
    "소심하고 머뭇거리는 말투":value=>`저기… 갑자기 연락해서 미안한데요. ${value}`,
    "열정적인 말투":value=>`있잖아요! 꼭 전하고 싶었어요! ${value}`,
    "능글맞고 여유로운 말투":value=>`뭐, 급한 건 아닌데 말이지. ${koreanCasual(value)}`,
    "냉소적인 말투":value=>`세상이 답을 대신 골라 주진 않으니까. ${koreanCasual(value)}`,
    "걸걸한 아저씨 말투":value=>`어이, 잠깐 얘기 좀 해 보자고. ${koreanCasual(value)}`,
    "거칠고 상스러운 말투 · 순화":value=>`아, 복잡하게 굴 것 없이 들어 봐. ${koreanCasual(value)}`,
    "중2병 말투":value=>`봉인의 틈에서 전언이 도착했다… ${koreanPlain(value)}`,
    "귀여니체 · 2000년대 인터넷소설체":value=>`있자나… 갑자기 니 생각나서 연락했오 ㅠ_ㅠ ${koreanCasual(value)}`,
    "하드보일드 누아르체":value=>`${koreanPlain(value)} 이 도시의 하루는 늘 그런 식으로 흘렀다.`,
    "고풍스러운 말투":value=>`문득 그대 생각이 났네. ${koreanPlain(value)}`,
    "사극 선비 말투":value=>`잠시 그대에게 전할 말이 있소. ${koreanPlain(value)}`,
    "군인식 말투":value=>`연락 사항 보고. ${koreanFormal(value)}`,
    "마왕의 말투":value=>`필멸자여, 짐의 말을 들으라. ${koreanSovereign(value)}`,
    "군주의 말투":value=>`그대여, 짐의 말을 새겨들으라. ${koreanSovereign(value)}`,
    "신탁을 내리는 신의 말투":value=>`이 신탁을 받으라. ${koreanSovereign(value)}`,
    "옛날 번역기체":value=>`당신에게 다음의 사실이 연락됩니다. ${value}`,
    "귀엽고 애교 있는 말투":value=>`${value} 나한테도 대답해 주면 안 돼요오?`,
    "수다스럽고 말이 많은 말투":value=>`별일은 아니고 그냥 생각이 나서 연락한 건데요, 있잖아요, ${value}`
  };
  return (wrappers[style]||((value)=>value))(text);
}

export function characterPlanSpeech(character,language="ko"){
  const style=effectiveSpeechStyle(character);
  if(language==="en")return characterQuestionPrompt(character,{kind:"everyday",language,base:"I'll do things in this order today."}).replace(/\?$/,".");
  if(language==="ja")return characterQuestionPrompt(character,{kind:"everyday",language,base:"今日はこの順番でやってみます。"}).replace(/？$/,"。");
  const lines={
    "반말":"오늘은 이 순서대로 해 볼게.","했다체 · 건조한 서술":"오늘은 이 순서대로 하기로 했다.","존댓말 · 해요체":"오늘은 이 순서대로 해 볼게요.","격식 있는 존댓말 · 하십시오체":"오늘은 이 순서대로 진행하겠습니다.","극존칭":"오늘은 분부해 주신 순서대로 행하겠사옵니다.","무뚝뚝한 단답":"이 순서. 그대로 해.","기계적인 말투":"작업 순서 확인. 계획을 실행합니다.","사무적인 말투 · 직장 메일체":"금일 일정은 해당 순서로 진행 예정입니다.","판교어 · 스타트업 업무체":"오늘 액션 아이템은 이 순서로 얼라인해서 진행할게요.","다정하고 부드러운 말투":"오늘은 이 순서대로 천천히 해 볼게요.","상냥하고 배려하는 말투":"무리하지 않게 이 순서대로 해 볼게요.","소심하고 머뭇거리는 말투":"저… 오늘은 이 순서대로 해 봐도 될까요?", "열정적인 말투":"좋아요! 오늘은 이 순서대로 힘차게 해 볼게요!", "능글맞고 여유로운 말투":"뭐, 오늘은 이 순서가 제일 재밌겠네.","냉소적인 말투":"계획대로 된다는 보장은 없지만, 일단 이 순서지.","걸걸한 아저씨 말투":"좋아, 오늘은 이 순서대로 시원하게 해 보자고.","거칠고 상스러운 말투 · 순화":"복잡하게 굴 것 없이 이 순서대로 확 해치우자고.","중2병 말투":"정해진 운명의 순서대로 오늘의 의식을 시작하지.","귀여니체 · 2000년대 인터넷소설체":"오늘은 이 순서대루 해볼꺼야아 >_<", "하드보일드 누아르체":"순서는 정해졌다. 남은 건 묵묵히 걷는 일뿐이다.","고풍스러운 말투":"오늘은 이 순서대로 행해 보겠네.","사극 선비 말투":"오늘은 정한 차례에 따라 행하겠소.","군인식 말투":"금일 일정 확인. 순서대로 수행하겠습니다.","마왕의 말투":"정해진 순서대로 오늘의 권능을 펼치리라.","군주의 말투":"오늘은 이 순서대로 국사를 돌보겠다.","신탁을 내리는 신의 말투":"정해진 순서대로 행하라. 길이 열릴지니.","옛날 번역기체":"오늘 나는 이 순서에 의하여 행동할 것입니다.","귀엽고 애교 있는 말투":"오늘은 이 순서대로 해 볼게요오.","수다스럽고 말이 많은 말투":"오늘 할 게 꽤 많긴 한데요, 일단 이 순서대로 하나씩 해 보면 딱 좋을 것 같아요."
  };
  return lines[style]||"오늘은 이 순서대로 해 볼게요.";
}
