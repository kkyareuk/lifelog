import {effectiveSpeechStyle,characterContactSpeech} from './speech-styles.js?v=20260903sync206';

// Complete messages, not a character-flavored greeting followed by a generic
// comfort paragraph. Each pair keeps its register through the last sentence.
const TOPIC_LINES={
  ko:{
    checkins:[['밥은 먹었나. 안 먹었으면 챙겨.','오늘은 별일 없었나. 필요한 말만 해.'],['식사는 하셨습니까? 해야 할 일이 있더라도 그것부터 챙기십시오.','오늘 무슨 일이 있었습니까? 중요한 것부터 말씀해 주십시오.']],
    worries:[['생각만 해서는 안 끝나겠군. 지금 할 수 있는 쪽부터 고른다.','선택지가 둘이다. 어느 쪽이 쓸모 있는지 말해 봐.'],['선택지를 검토하고 있습니다. 당장 실행할 수 있는 쪽이 합리적이겠지요.','결정할 일이 있습니다. 각각의 이득과 손해를 분명히 해 두고 싶습니다.']],
    comfort:[['오늘 할 만큼 했다. 더 버티지 말고 쉬어.','지쳤으면 앉아. 무리해서 나아질 일은 아니야.'],['지금은 휴식이 필요해 보입니다. 무리한다고 결과가 좋아지지는 않습니다.','오늘의 일은 여기서 멈추시지요. 판단은 쉬고 난 뒤에 해도 늦지 않습니다.']],
    moments:[['하나 끝냈다. 다음 일을 확인하는 중이야.','잠깐 쉬는 중이다. 끝나면 다시 움직인다.'],['하던 일은 마쳤습니다. 다음 순서를 확인하고 있습니다.','잠시 시간을 비워 두었습니다. 다음 일에 차질이 없도록 정리하는 중입니다.']],
    relationships:[['{target}에게 할 말이 있다. 돌아가지 말고 직접 말하겠어.','{target}의 생각이 걸리는군. 짐작만 하지 말고 확인해야겠어.'],['{target}에게 확인할 사항이 있습니다. 추측만으로 판단하지는 않겠습니다.','{target}와 나눌 이야기를 정리하고 있습니다. 의도를 분명히 전하는 편이 좋겠지요.']],
    home:[['{home} 정리 중이다. 어지러운 건 그냥 못 넘기겠군.','{home}에 있다. 필요한 것부터 정리하고 있어.'],['{home}을 정리하고 있습니다. 필요한 물건은 제자리에 두어야겠지요.','{home}에서 잠시 머무르고 있습니다. 그동안 주변을 정돈해 두겠습니다.']],
    work:[['일을 나누는 중이다. 급한 것부터 끝낸다.','다음 일을 확인했다. 쓸데없이 시간 끌 생각은 없어.'],['업무 순서를 검토하고 있습니다. 우선순위를 명확히 할 필요가 있습니다.','남은 일과 시간을 확인했습니다. 불필요한 지연은 피하고 싶습니다.']],
    tastes:[['{item}, 나쁘지 않더군. 다시 살펴볼 생각이야.','{item} 생각이 났다. 취향은 쉽게 안 바뀌는군.'],['{item}에 관심이 갑니다. 제 취향에 맞는 부분을 다시 확인하고 싶습니다.','{item}을 다시 살펴보고 있습니다. 마음에 드는 데에는 이유가 있는 법이지요.']]
  },
  en:{
    checkins:[['Have you eaten? Take care of that first.','Anything happen today? Tell me what matters.'],['Have you had a meal? Attend to that before continuing your work.','How did today go? Please begin with the important details.']],
    worries:[['Thinking alone will not finish it. Pick something we can do now.'],['I am weighing the options. An actionable choice would be preferable.']],
    comfort:[['You have done enough. Rest.','Sit down if you are tired. Pushing harder will not help.'],['Rest seems necessary now. Overexertion will not improve the result.']],
    moments:[['One task done. Checking the next.'],['The task is complete. I am reviewing the next step.']],
    relationships:[['I have a question for {target}. I will ask directly.'],['There is something I must clarify with {target}. I will not rely on assumptions.']],
    home:[['Tidying {home}. No reason to leave a mess.'],['I am putting {home} in order. Necessary things should be in their proper places.']],
    work:[['Sorting the work. Urgent things first.'],['I am reviewing the work. Priorities need to be clear.']],
    tastes:[['{item} was good. I may take another look.'],['I am interested in {item}. I would like to examine what appeals to me.']]
  },
  ja:{
    checkins:[['飯は食ったか。まだなら先に食え。','今日は何かあったか。必要なことだけ話せ。'],['食事は済ませましたか。仕事があっても、まずは食事を取ってください。','今日は何がありましたか。重要なことから話してください。']],
    worries:[['考えるだけでは終わらないな。今できるほうを選ぶ。'],['選択肢を検討しています。今実行できるほうが合理的でしょう。']],
    comfort:[['今日は十分やった。これ以上無理せず休め。','疲れたなら座れ。無理しても良くはならない。'],['今は休息が必要でしょう。無理をしても結果は良くなりません。']],
    moments:[['一つ終わった。次を確認している。'],['一つ終わりました。次の手順を確認しています。']],
    relationships:[['{target}に聞くことがある。回りくどいことはせず直接聞く。'],['{target}に確認したいことがあります。推測だけでは判断しません。']],
    home:[['{home}を片づけている。散らかしたままにはできないな。'],['{home}を整えています。必要な物は定位置に置くべきでしょう。']],
    work:[['仕事を分けている。急ぎのものから片づける。'],['仕事の順序を検討しています。優先順位を明確にする必要があります。']],
    tastes:[['{item}か。悪くなかった。また見てみる。'],['{item}が気になります。好みに合う部分を改めて確認したいですね。']]
  }
};

export const CONTACT_VOICE_VERSION=2;
export function characterMomentSpeech(character,neutral,{topic='moments',context={},language='ko',seed=0}={}){
  const style=effectiveSpeechStyle(character);
  if(style==='과묵한 직설체'||style==='냉정한 격식체'){
    const topics=TOPIC_LINES[language]||TOPIC_LINES.ko;
    const pool=(topics[topic]||topics.moments)[style==='냉정한 격식체'?1:0];
    return pool[Math.abs(seed)%pool.length].replace(/\{(\w+)\}/g,(_,key)=>String(context[key]||''));
  }
  // Both the action and the ending pass through the same full-body transform.
  return characterContactSpeech(character,neutral,{language});
}
