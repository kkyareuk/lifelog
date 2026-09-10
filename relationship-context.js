import {narrativeRate} from "./official-relationship-details.js?v=20260909dev305";
import {relationshipMemory} from "./relationship-memories.js?v=20260909dev305";
// Directional observations: a relationship supplies context, never mutual feelings.
const list=value=>Array.isArray(value)?value:[];
export const relationshipMembers=r=>[...new Set([r?.a,r?.b,...list(r?.groupMembers),...list(r?.memberIds),...list(r?.characterIds)].filter(Boolean))];
export function relationshipBetween(world,a,b){
  const matches=Object.values(world.relationships||{}).filter(r=>relationshipMembers(r).includes(a)&&relationshipMembers(r).includes(b));
  return matches.find(r=>r.temporalStatus!=='past')||matches[0]||null;
}
export function viewSignals(view={}){
  return {
    romantic:/연애 감정|깊이 사랑|없어서는 안 될/.test(view.overall||''),
    caring:/인간적인 호감|친구로 좋아|소중|존경|동경|안쓰럽/.test(view.overall||''),
    hostile:/매우 싫|미워|애증/.test(view.overall||''),
    guarded:/경계|불편|부담/.test(view.overall||''),
    afraid:['조금 두려움','경계하며 두려워함','많이 두려움','공포를 느낌','극도로 두려워함'].includes(view.fear),
    distrust:['전혀 믿지 않음','의심함'].includes(view.trust),
    annoyed:['가끔 성가심','종종 귀찮음','많이 귀찮고 성가심','보기만 해도 피곤함'].includes(view.annoyance),
    uncomfortable:/불편|숨 막|긴장/.test(view.comfort||''),
    distant:['남보다도 멂','낯선 사이','거리감 있음'].includes(view.closeness),
    unaware:/착각|전혀 모름|부정/.test(view.awareness||''),
    conflict:['갈등이 거의 없음','가끔 부딪힘','자주 충돌함','격렬하게 충돌함','파국적인 충돌을 반복함'].indexOf(view.conflictIntensity),
    urge:['공격 충동 없음','거친 말을 하고 싶은 충동','몸으로 밀어내고 싶은 충동','해치고 싶은 충동','죽이고 싶을 만큼 격한 충동'].indexOf(view.aggression)
  };
}
const hash=value=>[...String(value)].reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619)>>>0,2166136261);
const line=(ko,en,ja)=>({ko,en,ja});
const alternate={
 fear:line('상대의 움직임을 확인하며 통로를 막지 않는 쪽에 머물렀어요.','They watched the other person’s movements and stayed where the way out remained clear.','相手の動きを確認しながら、通り道をふさがない位置に留まりました。'),
 trust:line('바로 결론을 내리지 않고, 확인이 필요한 부분을 다시 물었어요.','They asked again about the uncertain parts instead of reaching a conclusion.','すぐ結論を出さず、確認が必要な部分をもう一度尋ねました。'),
 annoyance:line('자기 일이 끊긴 지점을 기억해 두고, 용건이 끝나자 그 부분부터 이어 갔어요.','They kept track of where they were interrupted and resumed there when the exchange ended.','中断した箇所を覚えておき、用件が終わるとそこから再開しました。'),
 awareness:line('상대에게 신경 쓴 이유를 다른 데서 찾다가, 결국 답을 내리지 못했어요.','They searched for another explanation for their attention but reached no answer.','相手が気になる理由を別のところに探しましたが、結局答えは出ませんでした。'),
 mutualAwareness:line('작은 반응 하나로 마음을 안다고 단정하지 않고 다음 말을 기다렸어요.','They waited for what came next rather than assuming a small reaction revealed the other person’s feelings.','小さな反応だけで気持ちが分かったと決めつけず、次の言葉を待ちました。'),
 importance:line('먼저 끝내려던 일을 잠시 뒤로 미루고 상대의 용건부터 확인했어요.','They put off what they had planned to finish first and checked what the other person needed.','先に済ませるつもりだったことを少し後回しにして、相手の用件を確かめました。'),
 attention:line('자기 일을 하면서도 상대가 멈추는 순간을 알아차리고 필요한지 물었어요.','While working, they noticed the other person pause and asked whether anything was needed.','自分の作業をしながら相手が手を止めたことに気づき、必要な物があるか尋ねました。'),
 jealousy:line('함께할 일이 끝나 가자 다음에 둘이 시간을 낼 수 있는지 확인했어요.','As their shared task drew to an end, they checked when they could spend time together again.','一緒の作業が終わりに近づくと、次に二人で時間を取れるか確かめました。'),
 aggressionAction:line('욱한 순간 바로 반응하지 않고, 손에 든 것을 내려놓은 뒤 생각을 가다듬었어요.','They set down what they were holding and collected themselves instead of reacting on impulse.','かっとなってもすぐには反応せず、手にした物を置いて考えを整えました。'),
 aggression:line('거슬리는 부분에서 잠시 멈췄지만 바로 충돌하지 않고 자기 자리를 정리했어요.','They paused at something irritating but settled their own space instead of confronting the other person immediately.','気に障るところで少し止まりましたが、すぐ衝突せず自分の場所を整えました。'),
 touchIntensity:line('필요한 물건의 위치를 가리켜 알려 주고 상대가 직접 가져갈 때까지 기다렸어요.','They pointed out the needed item and waited for the other person to take it.','必要な物の位置を指して伝え、相手が自分で取るまで待ちました。')
};
// A cue is selected for the present action; the complete profile is not printed.
export function relationshipReaction(actor,other,view={},relation=null,{seed='',language='ko',previousKeys=[],moodScore=0,kind='talk'}={}){
  const memory=relationshipMemory(actor,other,relation,view,{seed,language});
  if(memory&&['talk','hangout','tea','dine'].includes(kind)&&!previousKeys.some(k=>String(k).startsWith('memory:'))&&hash(`${seed}:${actor.id}:memory-frequency`)%100<narrativeRate(view.importance))return {...memory,signals:viewSignals(view)};
  const s=viewSignals(view),candidates=[];
  const add=(key,weight,copy)=>candidates.push({key,weight,copy});
  const guarded=s.afraid||s.distrust||s.hostile||s.guarded||s.uncomfortable;
  if(s.afraid)add('fear',100,line('상대가 다가오는 만큼 한 걸음 물러나, 자리를 벗어날 여유를 남겨 두었어요.','They stepped back as the other person approached, keeping room to leave.','相手が近づく分だけ一歩下がり、その場を離れられる余地を残しました。'));
  if(s.distrust)add('trust',90,line('설명에서 확인할 수 있는 부분부터 짚고, 아직 모르는 것은 그대로 남겨 두었어요.','They checked the parts of the explanation they could verify and left the rest undecided.','説明のうち確かめられる部分を確認し、まだ分からないことは保留にしました。'));
  if(s.hostile||s.guarded)add('overall',85,line('필요한 일에는 응했지만 개인적인 이야기는 꺼내지 않았어요.','They took part in the task but kept personal matters to themselves.','必要なことには応じましたが、個人的な話は持ち出しませんでした。'));
  if(s.uncomfortable)add('comfort',82,line(/대화는 편안|장난은 잘 통/.test(view.comfort)?'대화는 이어 갔지만 자리는 조금 떨어진 곳을 골랐어요.':'옆자리를 비워 두고, 필요한 내용을 확인한 뒤 잠깐씩 대화를 쉬었어요.',/대화는 편안|장난은 잘 통/.test(view.comfort)?'They kept the conversation going while choosing a seat a little farther away.':'They left a seat between them and paused between practical exchanges.',/대화는 편안|장난은 잘 통/.test(view.comfort)?'会話は続けながら、少し離れた席を選びました。':'隣の席を空け、必要なことを確認しては少し会話を休みました。'));
  if(s.annoyed)add('annoyance',70,line('하던 일을 잠시 멈추고 상대의 용건을 확인한 뒤 자기 일로 돌아갔어요.','They paused to check what the other person needed, then returned to their task.','手を止めて相手の用件を確かめてから、自分の作業に戻りました。'));
  if(view.annoyance==='전혀 귀찮거나 성가시지 않지만 성가시다고 말함')add('annoyance',65,line('번거롭다는 반응을 보이면서도 하던 일을 멈추고 끝까지 함께했어요.','They made a show of finding it bothersome, yet put their own task aside and stayed through the end.','面倒そうな反応をしながらも、自分の作業を止めて最後まで付き合いました。'));
  if(s.urge>0&&view.aggressionAction==='행동으로 옮기지 않음')add('aggressionAction',80,line('반박하고 싶은 순간 손을 멈추고, 행동으로 옮기기 전에 생각을 정리했어요.','They paused when the urge to push back arose and collected their thoughts before acting.','反発したくなったところで手を止め、行動に移す前に考えを整理しました。'));
  else if(s.urge>0)add('aggression',75,line('감정이 치미는 것을 느끼자 하던 일을 잠시 멈추고 상대와 간격을 두었어요.','As irritation rose, they paused the task and put some space between them.','感情がこみ上げると、作業をいったん止めて相手と間隔を空けました。'));
  if(s.conflict>0)add('conflictIntensity',60,line(actor.conflictStyle==='피하는 편'?'의견이 다른 부분은 당장 결론 내리지 않고, 겹치지 않는 일을 먼저 맡았어요.':'방식이 다른 부분을 확인하고, 지금 함께할 수 있는 일부터 골랐어요.',actor.conflictStyle==='피하는 편'?'They left the disagreement unresolved for now and took a task that would not overlap.':'They identified their different approaches and chose something they could do together for now.',actor.conflictStyle==='피하는 편'?'意見が違う点は今すぐ決着をつけず、重ならない作業を先に引き受けました。':'やり方の違いを確認し、今一緒にできることから選びました。'));
  if(s.distant)add('closeness',60,line('상대의 물건과 자기 물건을 구분해 두고, 필요한 것이 있으면 먼저 확인했어요.','They kept their belongings separate and checked before using anything they needed.','互いの持ち物を分けて置き、必要な物があれば先に確認しました。'));
  if(s.romantic&&s.unaware)add('awareness',guarded?84:65,line('상대의 작은 반응이 자꾸 눈에 들어왔지만, 왜 신경 쓰이는지는 스스로도 정리하지 못했어요.','Small reactions kept catching their attention, though they could not make sense of why.','相手の小さな反応が何度も目に入りましたが、なぜ気になるのか自分でも整理できませんでした。'));
  if(/전혀 모름|오해|어렴풋/.test(view.mutualAwareness)&&s.romantic)add('mutualAwareness',65,line('상대의 반응에 의미를 붙이려다 멈추고, 지금 분명히 확인한 말만 기억해 두었어요.','They stopped short of reading into the response and held on only to what had actually been said.','相手の反応に意味を見いだしかけてやめ、実際に確かめた言葉だけを覚えておきました。'));
  if(!guarded&&(s.romantic||s.caring))add('overall',45,line('자기 몫을 챙기다가 상대에게도 필요한 것이 있는지 확인했어요.','While taking care of their own part, they checked whether the other person needed anything.','自分の分を用意しながら、相手にも必要な物がないか確かめました。'));
  if(!guarded&&/깊이 신뢰|전적으로 의지/.test(view.trust))add('trust',45,line('함께 맡은 부분은 상대에게 맡기고, 자기는 나머지 일을 이어 갔어요.','They trusted the other person with their part and continued with the remaining work.','相手の担当分は任せ、自分は残りの作業を続けました。'));
  if(!guarded&&/가장 가까운|가까운 사이/.test(view.closeness))add('closeness',40,line('설명을 길게 하지 않아도 함께 쓰던 순서를 떠올려 다음 일을 이어 갔어요.','They picked up their familiar routine without needing a long explanation.','長く説明しなくても、いつもの手順を思い出して次の作業に移りました。'));
  if(!guarded&&/말없이 함께|완벽하게 편안/.test(view.comfort))add('comfort',45,line('말이 끊겨도 새 화제를 찾지 않고, 같은 자리에서 각자의 일을 이어 갔어요.','When conversation paused, they stayed together and continued their own tasks without filling the silence.','会話が途切れても話題を探さず、同じ場所でそれぞれの作業を続けました。'));
  if(/자주 살핌|최우선/.test(view.attention))add('attention',45,line('하던 일 사이사이 상대가 어디까지 했는지 살피고 기다릴 때를 맞췄어요.','Between steps, they checked the other person’s progress and timed their pauses to match.','作業の合間に相手の進み具合を見て、待つタイミングを合わせました。'));

  if(/은근히 질투|질투가 심|독점/.test(view.jealousy)&&['talk','hangout','tea','dine'].includes(kind))add('jealousy',50,line('함께할 시간이 얼마나 남았는지 확인하고, 조금 더 같이할 일을 찾아보았어요.','They checked how much time remained together and looked for something that would let it last a little longer.','一緒にいられる時間がどれだけ残っているか確かめ、もう少し一緒にできることを探しました。'));
  if(/곧 헤어질|언제든 끝날/.test(view.expectation))add('expectation',60,line('다음 약속까지 정하기보다는 오늘 하기로 한 일에만 답을 주었어요.','They committed only to today’s task instead of making plans for another time.','次の約束まで決めるより、今日することだけに返事をしました。'));
  else if(!guarded&&/오래 함께|평생/.test(view.expectation))add('expectation',35,line('오늘 못 마친 부분은 다음에 이어 할 수 있도록 따로 정리해 두었어요.','They set aside the unfinished part so they could return to it together another time.','今日終わらなかった分は、次に一緒に続けられるよう分けておきました。'));
  if(view.touchIntensity==='신체 접촉 없음'&&['comfort','hangout','talk'].includes(kind))add('touchIntensity',35,line('손을 뻗는 대신 상대가 쓰기 편한 자리에 필요한 것을 놓았어요.','Instead of reaching toward them, they placed what was needed within easy reach.','相手に手を伸ばす代わりに、必要な物を使いやすい位置に置きました。'));
  if(moodScore<-10)add('currentMood',88,line('방금까지 가라앉지 않은 기분 때문에 잠시 호흡을 고르고, 당장 할 수 있는 작은 일부터 시작했어요.','Still unsettled by the earlier moment, they took a breath and began with a small manageable step.','先ほどから気持ちが落ち着かず、ひと呼吸置いて今できる小さなことから始めました。'));
  if(!guarded&&!s.annoyed){
    const personality=list(actor.personalityTypes);
    if(personality.includes('철두철미함')||['계획적','강박적으로 계획함'].includes(actor.planningStyle))add('personality',42,line('빠뜨린 부분을 하나씩 확인하고 다음에 할 순서를 상대와 맞췄어요.','They checked for omissions and coordinated the next steps with the other person.','抜けている部分を一つずつ確認し、次の手順を相手と合わせました。'));
    else if(personality.includes('호기심 많고 창의적')||actor.perceptionStyle==='가능성 중시')add('personality',42,line('다른 방법도 가능한지 물어보고, 상대의 제안과 나란히 비교했어요.','They asked whether another approach was possible and compared it with the other person’s suggestion.','別の方法もあるか尋ね、相手の提案と並べて比べました。'));
    else if(actor.socialStyle==='혼자가 편함'||personality.includes('무심하고 독립적'))add('personality',42,line('같이할 부분을 마친 뒤 각자 하던 일을 이어 갈 시간을 남겼어요.','They finished the shared part and left time for each to return to their own work.','一緒にする部分を終え、それぞれの作業に戻る時間を残しました。'));
  }
  const ranked=candidates.map(c=>({...c,priority:c.weight-(previousKeys.includes(c.key)?25:0)+hash(`${seed}:${actor.id}:${c.key}`)%20})).sort((a,b)=>b.priority-a.priority);
  const chosen=ranked[0];
  const alternativeAllowed=chosen&&(chosen.key!=='trust'||s.distrust)&&(chosen.key!=='annoyance'||s.annoyed);
  if(alternativeAllowed&&alternate[chosen.key]&&hash(`${seed}:${actor.id}:variation`)%2)chosen.copy=alternate[chosen.key];
  const fallback=line('상대가 하던 부분을 확인하고, 겹치지 않는 일을 이어 갔어요.','They checked what the other person was doing and continued with a separate part.','相手がしていることを確認し、重ならない作業を続けました。');
  let context=null;
  if(relation?.temporalStatus==='past')context=line('예전에 알던 방식을 그대로 기대하지 않고 지금의 의사를 확인했어요.','They checked what the other person wanted now instead of assuming their old habits still applied.','昔のやり方をそのまま期待せず、今の意思を確認しました。');
  else if(relation?.type==='사제 관계'){
    const teacher=relation.teacherId||(relation.targetRole==='스승'?relation.b:relation.a);
    context=actor.id===teacher?line('배운 내용을 어디까지 해 보았는지 먼저 살폈어요.','They first checked how far the other person had tried applying what they learned.','教えたことをどこまで試したか、先に確かめました。'):line('배운 것 중 혼자 해 보다가 막힌 부분을 짚었어요.','They pointed out where they had got stuck while trying what they learned.','習ったことを自分で試して、つまずいた部分を示しました。');
  }else if(relation?.type==='부부')context=line('함께 정할 일과 각자 정할 일을 나누어 확인했어요.','They distinguished shared decisions from things each would decide individually.','一緒に決めることと、それぞれで決めることを分けて確認しました。');
  else if(relation?.type==='부모·자녀')context=line('가족이라는 이유로 대신 결정하지 않고 상대의 선택을 확인했어요.','They checked the other person’s choice instead of deciding for them as family.','家族だからと代わりに決めず、相手の選択を確かめました。');
  else if(relation?.type==='라이벌')context=line('서로 다른 방법으로 한 부분을 나란히 놓고 비교했어요.','They compared the parts they had approached differently.','違う方法で取り組んだ部分を並べて比べました。');
  // Avoid repeating the official role on every encounter. Feelings stay directional.
  const prefix=context&&hash(`${seed}:${actor.id}:role`)%3===0?context[language]||context.ko:'';
  const actions={fear:line('거리를 지키는 중','Keeping some distance','距離を保っているところ'),trust:line('확인할 부분을 짚는 중','Checking the details','確かめたい点を確認しているところ'),annoyance:line('용건을 확인하는 중','Checking what is needed','用件を確かめているところ'),awareness:line('신경 쓰이는 마음을 정리하는 중','Making sense of their feelings','気になる気持ちを整理しているところ'),mutualAwareness:line('상대의 반응을 살피는 중','Considering the response','相手の反応をうかがっているところ'),conflictIntensity:line('서로 다른 방식을 조율하는 중','Working around different approaches','やり方の違いを調整しているところ'),personality:line('함께할 일의 순서를 맞추는 중','Coordinating their next steps','一緒にすることの順番を合わせているところ')};
  const action=actions[chosen?.key]||line('함께할 일을 확인하는 중','Checking their shared task','一緒にすることを確認しているところ');
  return {title:action[language]||action.ko,text:[prefix,(chosen?.copy||fallback)[language]||(chosen?.copy||fallback).ko].filter(Boolean).join(' '),key:chosen?.key||'neutral',signals:s,candidateKeys:candidates.map(c=>c.key),relationType:relation?.type||''};
}

// Tendency is not an event. A quiet encounter is possible even for hostile pairs.
export function automaticConflictAllowed(first,second,a,b,date,world){
  const level=Math.max(0,viewSignals(a).conflict,viewSignals(b).conflict);
  if(!level)return false;
  const now=date.getTime(),day=new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime();
  const recent=[first,second].some(c=>Object.entries(c.days||{}).some(([key,record])=>list(record.entries).some(e=>{
    if(![e.withId,...list(e.withIds),...list(e.participantOrder)].includes(c.id===first.id?second.id:first.id))return false;
    const [year,month,dateOfMonth]=key.split("-").map(Number);
    const recordDay=new Date(year,month-1,dateOfMonth).getTime();
    const stamp=recordDay+Number(e.minute)*60000;
    return stamp<now&&now-stamp<180*60000&&(e.automaticConflict||/말다툼|거칠게 충돌|신경전|몸싸움/.test(e.title||''));
  })));
  if(recent)return false;
  const pair=[first.id,second.id].sort().join(':');
  const slot=Math.floor((date.getHours()*60+date.getMinutes())/45);
  const rate=[0,8,18,32,45][level];
  return hash(`${pair}:${day}:${slot}:conflict-opportunity`)%100<rate;
}
