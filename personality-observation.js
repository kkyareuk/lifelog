// Describe a visible action, then the observer's response. Unknown traits stay unknown.
const text=(ko,en,ja)=>({ko,en,ja});
const hash=value=>[...String(value)].reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619)>>>0,2166136261);
export const observationAxes=[
 ['decisionStyle','thinkingFeeling',['논리 우선','이성적인 편','균형형','마음을 살핌','공감 우선'],
  text('말을 보태기 전에 맞고 틀린 부분부터 딱 잘라 짚는 모습을 보았어요.','They watched the other person point out what was right or wrong before adding anything else.','相手が言葉を足す前に、正誤をきっぱり指摘する様子を見ました。'),
  text('답을 정하기 전에 듣는 사람의 표정부터 살피는 모습을 보았어요.','They noticed the other person check the listener’s expression before deciding on an answer.','相手が答えを決める前に、聞き手の表情を確かめる様子を見ました。')],
 ['planningStyle','perceivingJudging',['무계획','즉흥적','유연한 편','상황에 따라','미리 정리함','계획적','강박적으로 계획함'],
  text('방금 떠오른 생각에 따라 다음에 할 일을 바꾸는 모습을 보았어요.','They watched the other person change the next step to follow a fresh idea.','相手が思いついたことに合わせて、次にすることを変える様子を見ました。'),
  text('시작하기도 전에 할 일을 순서대로 적고 빠진 것이 없는지 다시 확인하는 모습을 보았어요.','They watched the other person list each step and check for omissions before even starting.','相手が始める前から手順を書き並べ、抜けがないか確かめる様子を見ました。')],
 ['perceptionStyle','sensingIntuition',['현실과 경험 중시','구체적인 편','균형형','가능성 중시','직관과 상상 중시'],
  text('새 이야기를 듣자 전에 직접 해 본 일과 하나씩 대조하는 모습을 보았어요.','They noticed the other person compare a new idea with things they had actually tried.','相手が新しい話を、自分で試したことと一つずつ照らし合わせる様子を見ました。'),
  text('아직 해 보지 않은 방법에서 다음 가능성까지 이야기를 뻗어 가는 모습을 보았어요.','They listened as the other person developed an untried approach into further possibilities.','相手がまだ試していない方法から、その先の可能性へ話を広げる様子を見ました。')],
 ['socialStyle','socialEnergy',['혼자가 편함','낯을 가림','조용히 어울림','먼저 다가감','무리의 중심'],
  text('대화가 잠시 끊기자 억지로 말을 채우지 않고 조용히 손에 든 일을 이어 가는 모습을 보았어요.','They noticed the other person continue quietly with their task when the conversation paused.','会話が途切れると、相手が無理に話を継がず静かに作業を続ける様子を見ました。'),
  text('눈이 마주치자 먼저 말을 걸고 다음 이야기까지 꺼내는 모습을 보았어요.','They noticed the other person start a conversation as soon as their eyes met and introduce another topic.','目が合うと相手が先に声をかけ、次の話題まで持ち出す様子を見ました。')],
 ['activityTempo',null,['한 가지씩 차분히','잠깐 쉬고 다음 일','상황에 따라','생각나면 바로 움직임','부산스럽게 여러 일을 오감','허둥대며 주의가 자주 옮겨감'],
  text('손에 든 일을 끝내고 잠깐 숨을 돌린 뒤 다음 일로 넘어가는 모습을 보았어요.','They watched the other person finish one task and pause before starting the next.','相手が一つの作業を終え、ひと息ついてから次に移る様子を見ました。'),
  text('하던 일을 잠시 내려놓고 새로 눈에 들어온 일에 손을 뻗는 모습을 보았어요.','They watched the other person set a task aside and reach for something that had just caught their eye.','相手が作業の手を止め、新しく目に入ったことに取りかかる様子を見ました。')],
 ['interference',null,['방관자','요청할 때만 도움','적당히 관여','챙기고 확인함','강하게 간섭함','컨트롤프릭','통제광'],
  text('도움을 청하기 전에는 곁에서 지켜보며 결정을 맡겨 두는 모습을 보았어요.','They noticed the other person watch and leave decisions alone until asked for help.','相手が助けを求められるまでは見守り、判断を任せる様子を見ました。'),
  text('이미 정한 일에도 다음에는 어떻게 할 것인지 거듭 확인하는 모습을 보았어요.','They noticed the other person repeatedly ask what would happen next, even after a decision was made.','相手が決まったことにも、次はどうするのか繰り返し確認する様子を見ました。')],
 ['neatness',null,['어질러도 편함','조금 느슨함','보통','정돈을 좋아함','흐트러짐을 못 참음','결벽에 가까움'],
  text('쓰던 물건을 손 닿는 곳에 내려놓고 다시 하던 일에 집중하는 모습을 보았어요.','They watched the other person leave a used item within reach and return to the task.','相手が使った物を手の届く所に置き、作業に戻る様子を見ました。'),
  text('물건 하나를 쓴 뒤에도 제자리에 돌려놓고 줄이 어긋나지 않게 맞추는 모습을 보았어요.','They watched the other person return each item and straighten it after use.','相手が物を一つ使うたびに元へ戻し、ずれないよう並べ直す様子を見ました。')],
 ['conflictStyle',null,['피하는 편','시간을 두고 말함','대화로 해결','바로 따짐','끝까지 결론을 냄'],
  text('의견이 갈리자 바로 답하지 않고 말을 고를 시간을 두는 모습을 보았어요.','They noticed the other person take time to choose their words when opinions differed.','意見が分かれると、相手がすぐ答えず言葉を選ぶ時間を取る様子を見ました。'),
  text('의견이 갈린 대목으로 다시 돌아가 결론을 확인하려는 모습을 보았어요.','They noticed the other person return to a disagreement to settle the conclusion.','相手が意見の分かれた箇所に戻り、結論を確かめようとする様子を見ました。')]
];
function level(character,[field,numeric,values]){
 const score=character.discovery?.scores?.[field];
 if(Number.isFinite(score))return Math.max(0,Math.min(100,score))/100;
 const i=values.indexOf(character[field]);
 if(i>=0)return i/(values.length-1);
 if(numeric&&Number.isFinite(character[numeric])&&character[numeric]>=1&&character[numeric]<=5)return (character[numeric]-1)/4;
 return null;
}
export function personalityObservation(actor,other,view={},signals={},seed=''){
 const options=observationAxes.map(axis=>({axis,a:level(actor,axis),b:level(other,axis)})).filter(x=>x.a!==null&&x.b!==null&&x.b!==.5);
 if(!options.length)return null;
 const {axis,a,b}=options[hash(`${seed}:${actor.id}:${other.id}:trait`)%options.length],matching=Math.abs(a-b)<.26;
 const guarded=signals.afraid||signals.distrust||signals.hostile||signals.guarded||signals.uncomfortable||signals.annoyed||signals.urge>0;
 const empathetic=['마음을 살핌','공감 우선'].includes(actor.decisionStyle)||(!actor.decisionStyle&&Number(actor.thinkingFeeling)>=4)||/이타|공감|배려/.test((actor.personalityTypes||[]).join(' '));
 const controlling=['강하게 간섭함','컨트롤프릭','통제광'].includes(actor.interference);
 // Explicit directional settings take precedence over general temperament.
 const irritated=!matching&&controlling&&signals.annoyed;
 const response=matching?(guarded?
  text('방식이 자기와 닮았다는 점은 알아보았지만, 그것만으로 마음의 거리를 좁히지는 않았어요.','They recognized a familiar approach without letting it erase their reservations.','自分と似たやり方だと気づきましたが、それだけで心の距離を縮めはしませんでした。'):
  text('자기라면 그렇게 했을 것 같아, 그 순간에는 따로 설명하지 않아도 된다는 편안함을 느꼈어요.','They would have done the same and felt at ease not having to explain that part.','自分もそうするだろうと思い、その点は説明しなくても通じることにほっとしました。')):
  empathetic?text('자기 방식과는 달랐지만, 상대가 그렇게 하는 이유부터 이해해 보려 했어요.','It differed from their own approach, but they tried to understand the reason behind it.','自分のやり方とは違いましたが、相手がそうする理由から理解しようとしました。'):
  irritated?text('자기가 정한 흐름과 자꾸 어긋나 답답했지만, 먼저 어디서 생각이 갈렸는지 짚어 보았어요.','Frustrated that it disrupted their intended order, they first traced where their approaches diverged.','自分の決めた流れとずれてもどかしくなり、まずどこで考えが分かれたのか確かめました。'):
  text('자기라면 다른 쪽을 택했을 것 같아, 왜 그 방법을 고르는지 잠시 생각했어요.','They would have chosen differently and paused to consider why the other person preferred that way.','自分なら別の方を選ぶだろうと思い、なぜその方法を選ぶのか少し考えました。');
 let observation=axis[b<.5?3:4];
 const harsh=!matching&&signals.hostile&&signals.annoyed&&!empathetic;
 if(harsh&&axis[0]==='activityTempo'&&other.activityTempo==='허둥대며 주의가 자주 옮겨감')observation=text('하던 일도 끝내지 않고 이쪽저쪽 허둥대는 꼴에 시선이 멈췄어요.','Their attention caught on the other person rushing back and forth without finishing anything.','相手が一つも終わらせずあちこち慌てる姿に、目が止まりました。');
 if(harsh&&axis[0]==='decisionStyle'&&b<.5)observation=text('듣는 사람의 마음보다 맞고 틀린 것부터 따지는 직언에 시선이 멈췄어요.','Their attention caught on a blunt correction that put accuracy ahead of the listener’s feelings.','聞き手の気持ちより正誤を優先する直言に、目が止まりました。');
 return {axis:axis[0],matching,copy:Object.fromEntries(['ko','en','ja'].map(lang=>[lang,observation[lang]+' '+response[lang]]))};
}
