import {expandDiscovery,calibrateDiscovery} from './discovery-extra.js?v=20260909dev305';
import {PROFILE_EVENTS} from './discovery-profile.js?v=20260909dev305';
// Sudden situations: players see only the scene and five actions, never the weights.
const tri=(ko,en,ja)=>({ko,en,ja});
const e=(id,icon,question,choices)=>({id,icon,animation:'talk',question:tri(...question),choices:choices.map(([ko,en,ja,effects])=>({text:tri(ko,en,ja),effects}))});
const toward=(index)=>({toward:index,weight:1});
export const DISCOVERY_EVENTS=[
e('early','☕',['약속보다 일찍 도착했어요. 상대는 아직 오는 중이에요.','They arrive early. The other person is still on the way.','約束より早く着きました。相手はまだ向かっています。'],[
 ['조용한 구석에 앉아 가방 속을 정리한다','Sit in a quiet corner and sort their bag','静かな隅に座り、鞄の中を整える',{socialStyle:-1,neatness:1}],
 ['자리와 주문을 먼저 정해 두고 메시지를 보낸다','Choose seats and orders, then send a message','席と注文を先に決めて連絡する',{planningStyle:1,interference:1}],
 ['근처 골목을 둘러보다 시간이 맞으면 돌아온다','Explore nearby streets and return in time','近くの路地を見て、時間になったら戻る',{energyRhythm:1,planningStyle:-1,perceptionStyle:1}],
 ['직원에게 추천 메뉴를 물으며 이야기를 나눈다','Chat with the staff about their recommendations','店員におすすめを聞いて話す',{socialStyle:1,humorStyle:1}],
 ['상대가 도착하면 함께 정하려고 잠시 쉰다','Rest for a while and decide together when they arrive','少し休み、相手が来てから一緒に決める',{interference:-1,energyRhythm:-1,impulseControl:-1}]]),
e('rain','☂',['갑자기 비가 내려 사람들이 처마 아래로 모였어요.','Rain starts suddenly and people gather under an awning.','急に雨が降り、軒下に人が集まってきました。'],[
 ['가장 안쪽에서 조용히 비가 그치길 기다린다','Wait quietly at the back for the rain to stop','奥で静かに雨がやむのを待つ',{socialStyle:-1,moodRecoveryStyle:toward(0)}],
 ['젖은 사람에게 자리를 내주고 옆으로 비켜선다','Make room for someone who is soaked','濡れた人に場所を譲って横へよける',{decisionStyle:1,interference:-1}],
 ['함께 우산을 살 곳을 찾아보자고 말을 건다','Suggest finding somewhere to buy umbrellas together','一緒に傘を買える場所を探そうと声をかける',{socialStyle:1,diligence:1,stressMoodResponse:toward(5)}],
 ['물웅덩이가 생기는 모양을 한참 바라본다','Watch the patterns forming in the puddles','水たまりの形をしばらく眺める',{perceptionStyle:1,activityTempo:-1,moodPersistence:1}],
 ['가방으로 머리를 가리고 가까운 가게까지 달린다','Cover their head with a bag and run to a nearby shop','鞄で頭を覆って近くの店まで走る',{energyRhythm:1,planningStyle:-1,impulseControl:1}]]),
e('parcel','▣',['이름이 지워진 작은 상자가 공용 공간에 놓여 있어요.','A small parcel with an unreadable name is in a shared space.','名前の消えた小箱が共有スペースに置かれています。'],[
 ['찾는 사람이 보도록 잘 보이는 곳에 가지런히 둔다','Set it neatly where its owner can see it','持ち主に見える所へきちんと置く',{neatness:1,interference:-1}],
 ['주변 사람들에게 누구 물건인지 물어본다','Ask around to find its owner','周りの人に誰の物か尋ねる',{socialStyle:1,diligence:1}],
 ['포장 흔적을 살펴 어디서 왔을지 추측한다','Study the wrapping and imagine where it came from','包装の跡を見て、どこから来たのか想像する',{perceptionStyle:1,activityTempo:-1}],
 ['담당자에게 맡기고 발견한 시간과 장소를 적는다','Hand it to the person in charge with a note of where and when','担当者に渡し、見つけた時刻と場所を記す',{planningStyle:1,decisionStyle:-1}],
 ['다른 사람 물건이라 건드리지 않고 지나간다','Leave someone else’s property untouched and move on','他人の物なので触らず通り過ぎる',{interference:-1,diligence:-1}]]),
e('spill','☕',['옆자리 사람이 실수로 음료를 엎질렀어요.','Someone nearby accidentally spills a drink.','隣の人がうっかり飲み物をこぼしました。'],[
 ['놀란 사람에게 괜찮다고 말하며 휴지를 건넨다','Reassure them and pass some tissues','大丈夫と声をかけ、ティッシュを渡す',{decisionStyle:1,emotionalContagion:1,affectionStyle:toward(3)}],
 ['젖으면 안 되는 물건부터 빠르게 옮긴다','Quickly move the objects that must stay dry','濡らせない物から素早く移す',{decisionStyle:-1,activityTempo:1}],
 ['닦는 순서를 정하고 함께 정리하자고 한다','Organize the cleanup and ask everyone to help','片づける順序を決め、一緒に拭こうと言う',{interference:1,neatness:1}],
 ['잠시 굳었다가 손을 떨며 자기 물건을 확인한다','Freeze briefly, then check their belongings with trembling hands','一瞬固まり、震える手で自分の物を確かめる',{emotionalSensitivity:1,moodVolatility:1,stressMoodResponse:toward(2)}],
 ['가벼운 농담으로 분위기를 풀며 젖은 자리를 닦는다','Make a gentle joke while wiping the wet spot','軽い冗談で空気を和らげながら拭く',{humorStyle:1,emotionalBaseline:toward(0),moodPersistence:-1}]]),
e('lost','◇',['처음 온 곳에서 안내판과 실제 길이 달라 보여요.','In an unfamiliar place, the signs do not seem to match the path.','初めての場所で、案内板と実際の道が違って見えます。'],[
 ['왔던 길을 되짚으며 표지 하나씩 다시 확인한다','Retrace their route and check each sign','来た道をたどり、標識を一つずつ確かめる',{perceptionStyle:-1,planningStyle:1}],
 ['지나가는 사람을 붙잡고 길을 물어본다','Ask a passerby for directions','通りかかった人に道を聞く',{socialStyle:1,stressMoodResponse:toward(5)}],
 ['눈에 들어오는 골목으로 조금 더 가 본다','Try the lane that catches their eye','気になった路地へ少し進んでみる',{perceptionStyle:1,planningStyle:-1,impulseControl:1}],
 ['한쪽에 멈춰 숨을 고르고 다시 생각한다','Stop to catch their breath and think again','端で息を整え、もう一度考える',{activityTempo:-1,impulseControl:-1,moodRecoveryStyle:toward(0)}],
 ['함께 온 사람에게 지도를 맡기고 뒤를 따른다','Let their companion handle the map and follow','同行者に地図を任せてついていく',{interference:-1,decisionStyle:1}]]),
e('change','▦',['함께 세운 일정이 갑자기 취소됐어요. 잠깐 빈 시간이 생겼네요.','A shared plan is suddenly canceled, leaving some free time.','一緒に立てた予定が急に中止になり、時間が空きました。'],[
 ['미뤄 둔 일을 꺼내 순서대로 처리한다','Work through tasks they had put off','後回しにしていたことを順に片づける',{planningStyle:1,diligence:1}],
 ['생각나는 곳으로 가 보자고 바로 제안한다','Immediately suggest going somewhere that comes to mind','思いついた場所へ行こうとすぐ提案する',{planningStyle:-1,activityTempo:1}],
 ['아쉬운 마음을 말하고 잠시 조용히 머문다','Say they are disappointed and stay quiet for a while','残念だと伝え、しばらく静かに過ごす',{emotionalExpression:1,moodPersistence:1,emotionalBaseline:toward(16)}],
 ['뜻밖의 휴식이라며 편한 자리를 찾는다','Find a comfortable spot for an unexpected break','思いがけない休憩だと、楽な場所を探す',{energyRhythm:-1,diligence:-1,positiveMoodResponse:toward(0)}],
 ['다른 사람도 괜찮은지 먼저 묻는다','First ask whether everyone else is okay','まず他の人も大丈夫か尋ねる',{decisionStyle:1,emotionalContagion:1,affectionStyle:toward(2)}]]),
e('gift','✦',['누군가 뜻밖의 작은 선물을 건넸어요.','Someone gives them an unexpected small gift.','誰かが思いがけず小さな贈り物をくれました。'],[
 ['말 대신 조심히 받아 들고 오래 바라본다','Accept it gently and look at it for a long time','言葉少なに受け取り、長く眺める',{emotionalExpression:-1,moodPersistence:1,affectionStyle:toward(1)}],
 ['환하게 웃으며 주변에도 보여 준다','Smile brightly and show it to the others','明るく笑って周りにも見せる',{emotionalExpression:1,positiveMoodResponse:toward(3),socialStyle:1}],
 ['왜 골랐는지 궁금해하며 이야기를 듣는다','Ask why they chose it and listen','選んだ理由を尋ね、話を聞く',{decisionStyle:1,perceptionStyle:1}],
 ['혹시 부담을 준 건 아닌지 먼저 살핀다','First wonder whether they have imposed on the giver','相手に負担をかけていないか気にする',{emotionalBaseline:toward(14),positiveMoodResponse:toward(4),emotionalSensitivity:1}],
 ['고마움을 전하고 다음엔 자신이 챙기겠다고 한다','Thank them and offer to return the kindness next time','礼を言い、次は自分が気遣いたいと伝える',{affectionStyle:toward(4),diligence:1}]]),
e('noise','♪',['조용하던 공간에서 갑자기 큰 소리가 났어요.','A sudden loud sound breaks the quiet.','静かな場所で突然大きな音がしました。'],[
 ['소리가 난 쪽을 확인하고 하던 일을 이어 간다','Check where it came from and resume their task','音のした方を確かめ、作業に戻る',{emotionalSensitivity:-1,moodPersistence:-1}],
 ['몸이 움찔해 잠시 말도 멈춘다','Flinch and fall silent for a moment','体がびくっとして、一瞬言葉が止まる',{emotionalSensitivity:1,moodVolatility:1}],
 ['놀란 사람에게 다가가 괜찮은지 묻는다','Approach someone who was startled and check on them','驚いた人に近づき、大丈夫か尋ねる',{emotionalContagion:1,decisionStyle:1}],
 ['불편한 표정을 숨기지 않고 조용히 해 달라고 한다','Show their discomfort and ask for quiet','不快な表情を隠さず、静かにしてほしいと伝える',{emotionalExpression:1,angerResponse:toward(6),conflictStyle:toward(3)}],
 ['조용한 곳으로 자리를 옮겨 마음을 가라앉힌다','Move somewhere quiet to settle down','静かな場所へ移って気持ちを落ち着ける',{socialStyle:-1,moodRecoveryStyle:toward(0),angerResponse:toward(4)}]]),
e('queue','…',['줄을 서 있는데 앞사람이 순서를 잘못 안 것 같아요.','While waiting in line, someone seems to have misunderstood their turn.','列に並んでいると、前の人が順番を勘違いしているようです。'],[
 ['잠시 기다렸다가 조용히 순서를 설명한다','Wait a moment, then quietly explain the order','少し待ってから静かに順番を説明する',{impulseControl:-1,conflictStyle:toward(2)}],
 ['바로 말을 걸어 원래 자리를 알려 준다','Speak up immediately and point out their place','すぐ声をかけ、本来の位置を伝える',{activityTempo:1,interference:1,angerResponse:toward(2)}],
 ['작은 일이라 생각하고 그냥 기다린다','Treat it as a small matter and keep waiting','小さなことだと思い、そのまま待つ',{interference:-1,moodPersistence:-1}],
 ['말은 하지 않지만 표정이 굳고 한동안 신경이 쓰인다','Say nothing, but tense up and dwell on it','何も言わないが表情が固まり、しばらく気になる',{moodPersistence:1,stressMoodResponse:toward(1),emotionalBaseline:toward(12)}],
 ['주변에 순서가 어떻게 됐는지 함께 확인한다','Check the order with the people nearby','周囲の人と一緒に順番を確かめる',{socialStyle:1,decisionStyle:-1,conflictStyle:toward(2)}]]),
e('cat','🐾',['작은 동물이 발치에 다가와 가만히 앉았어요.','A small animal comes over and sits by their feet.','小さな動物が足元に来て、じっと座りました。'],[
 ['움직이지 않고 동물이 먼저 다가오길 기다린다','Stay still and let the animal approach first','動かず、動物が近づくのを待つ',{impulseControl:-1,interference:-1}],
 ['낮은 목소리로 말을 걸며 천천히 손을 내민다','Speak softly and slowly offer a hand','小声で話しかけ、ゆっくり手を差し出す',{socialStyle:1,affectionStyle:toward(3)}],
 ['작은 움직임에도 놀라 한 걸음 물러난다','Startle at a small movement and step back','小さな動きにも驚いて一歩下がる',{emotionalSensitivity:1,touchReaction:toward(3)}],
 ['옷에 털이 묻지 않도록 자세를 고쳐 앉는다','Adjust their position to keep fur off their clothes','服に毛がつかないよう座り直す',{neatness:1,touchReaction:toward(7)}],
 ['함께 있는 사람에게 웃으며 손짓해 보여 준다','Smile and gesture for their companion to look','同行者へ笑顔で手招きして見せる',{positiveMoodResponse:toward(2),emotionalExpression:1}]]),
e('compliment','✧',['누군가 평소와 달라 보인다며 눈을 맞추고 웃었어요.','Someone meets their eyes and smiles, saying they look different today.','誰かが今日は雰囲気が違うねと、目を合わせて笑いました。'],[
 ['무슨 뜻인지 모르고 옷을 내려다본다','Look down at their clothes, unsure what was meant','意味がわからず自分の服を見下ろす',{flirtResponse:toward(0),perceptionStyle:-1}],
 ['짧게 고맙다고 하고 다른 이야기로 돌린다','Offer a brief thanks and change the subject','短く礼を言い、別の話題に移る',{flirtResponse:toward(1),emotionalExpression:-1}],
 ['조금 당황해 시선을 피하고 거리를 둔다','Look away, flustered, and give themselves some space','少し戸惑って目をそらし、距離を取る',{flirtResponse:toward(2),socialStyle:-1}],
 ['상대의 달라진 점도 찾아 웃으며 말해 준다','Smile and point out something different about them too','相手の変化も見つけ、笑って伝える',{flirtResponse:toward(4),humorStyle:1}],
 ['미소를 돌려주며 조금 더 이야기를 이어 간다','Return the smile and keep talking a little longer','笑顔を返し、もう少し話を続ける',{flirtResponse:toward(3),socialStyle:1,affectionStyle:toward(2)}]]),
e('crowd','↔',['좁은 통로에서 사람들이 가까이 지나가고 있어요.','People are passing close by in a narrow corridor.','狭い通路を、人が近くを通り過ぎています。'],[
 ['몸을 옆으로 돌려 사람들이 지나가게 한다','Turn sideways to let people pass','体を横にして人を通す',{interference:-1,touchReaction:toward(0)}],
 ['닿을까 봐 가방을 앞에 안고 빈틈을 찾는다','Hold their bag in front and look for a gap','触れないよう鞄を前に抱え、隙間を探す',{touchReaction:toward(7),emotionalSensitivity:1}],
 ['먼저 지나가겠다고 분명히 말한다','Clearly ask to pass through first','先に通りたいとはっきり伝える',{socialStyle:1,interference:1}],
 ['가까운 사람 옆에 붙어 함께 천천히 움직인다','Stay beside someone close and move slowly together','親しい人のそばで、一緒にゆっくり進む',{touchReaction:toward(8),affectionStyle:toward(1),activityTempo:-1}],
 ['사람이 줄어들 때까지 한쪽에서 기다린다','Wait to one side until the crowd thins','人が減るまで脇で待つ',{impulseControl:-1,energyRhythm:-1}]]),
e('puzzle','▧',['탁자 위에 누군가 풀다 만 작은 퍼즐이 있어요.','Someone has left a half-finished puzzle on a table.','机に誰かが途中まで解いた小さなパズルがあります。'],[
 ['모서리 조각부터 모아 맞춰 본다','Gather the edge pieces and try fitting them','端のピースから集めて合わせる',{planningStyle:1,neatness:1}],
 ['완성된 그림을 상상하며 눈에 띄는 조각을 고른다','Imagine the finished picture and pick an interesting piece','完成図を想像し、目についたピースを選ぶ',{perceptionStyle:1,planningStyle:-1}],
 ['주변 사람에게 같이 해 보자고 권한다','Invite the people nearby to try it together','周囲の人を一緒にやろうと誘う',{socialStyle:1,emotionalBaseline:toward(7)}],
 ['끝이 보일 때까지 자리를 떠나지 않는다','Keep working until the end is in sight','終わりが見えるまで取り組み続ける',{diligence:1,moodPersistence:1}],
 ['잠깐 살펴보다 다른 것이 눈에 들어와 이동한다','Look briefly, then move on when something else catches their eye','少し見てから、別のものに目を引かれて移動する',{activityTempo:1,diligence:-1}]]),
e('mistake','▤',['함께 정리한 기록에서 작은 실수를 발견했어요.','They find a small mistake in a record made together.','一緒にまとめた記録に、小さな間違いを見つけました。'],[
 ['틀린 부분과 근거를 표시해 함께 확인한다','Mark the error and the evidence to check together','誤りと根拠を示し、一緒に確かめる',{decisionStyle:-1,conflictStyle:toward(2)}],
 ['상대가 무안하지 않게 따로 조용히 알려 준다','Tell the person privately to spare their embarrassment','相手が困らないよう、二人の時にそっと伝える',{decisionStyle:1,emotionalContagion:1}],
 ['바로 고치고 다음에는 확인을 맡겠다고 한다','Fix it immediately and offer to check next time','すぐ直し、次は自分が確認すると申し出る',{interference:1,diligence:1}],
 ['왜 또 이런 일이 생겼는지 한숨부터 나온다','Sigh first, wondering why this happened again','なぜまた起きたのかと、先にため息が出る',{emotionalBaseline:toward(11),angerResponse:toward(1),moodVolatility:1}],
 ['급하지 않으면 잠시 쉬고 다시 보자고 한다','Suggest a short break before checking again if it is not urgent','急ぎでなければ、少し休んで見直そうと言う',{impulseControl:-1,moodRecoveryStyle:toward(2)}]]),
e('evening','☾',['해야 할 일을 마쳤는데 아직 잠들기엔 이른 시간이네요.','Their tasks are done, but it is still early for bed.','やることは終わりましたが、寝るにはまだ早い時間です。'],[
 ['물건을 제자리에 놓고 다음 날 준비를 해 둔다','Put things away and prepare for tomorrow','物を戻し、翌日の準備をする',{neatness:1,planningStyle:1}],
 ['누군가에게 연락해 오늘 있었던 일을 나눈다','Contact someone to talk about the day','誰かに連絡し、今日のことを話す',{socialStyle:1,moodRecoveryStyle:toward(1)}],
 ['좋아하는 것에 몰두하다 시간이 흐르는 줄 모른다','Lose track of time enjoying something they like','好きなことに夢中になり、時間を忘れる',{moodRecoveryStyle:toward(3),planningStyle:-1}],
 ['불을 낮추고 아무것도 하지 않으며 쉰다','Dim the lights and rest without doing anything','照明を落とし、何もせず休む',{energyRhythm:-1,activityTempo:-1}],
 ['밖에 잠깐 나가 새로운 구경거리를 찾는다','Step outside to find something new to see','少し外へ出て、新しいものを探す',{energyRhythm:1,perceptionStyle:1}]]),
e('silence','…',['여럿이 이야기하다 잠깐 대화가 끊겼어요.','A group conversation falls briefly silent.','皆で話していて、ふと会話が途切れました。'],[
 ['편안하게 침묵을 두고 차를 한 모금 마신다','Let the silence sit comfortably and sip their drink','沈黙を心地よく置き、飲み物を一口飲む',{socialStyle:-1,emotionalSensitivity:-1}],
 ['방금 떠오른 우스운 일을 꺼내 분위기를 푼다','Share a funny thought to lighten the mood','思いついた面白い話で空気を和らげる',{humorStyle:1,socialStyle:1}],
 ['표정이 어두워진 사람이 있는지 살핀다','Look around for anyone whose expression has changed','表情が曇った人がいないか見回す',{emotionalContagion:1,decisionStyle:1}],
 ['아직 결론이 나지 않은 이야기로 돌아간다','Return to the topic that was left unresolved','結論の出ていない話に戻る',{planningStyle:1,conflictStyle:toward(4),interference:1}],
 ['자신이 실수했나 되짚으며 말을 고른다','Choose their words while wondering if they made a mistake','自分が何か失敗したか振り返り、言葉を選ぶ',{emotionalBaseline:toward(14),emotionalSensitivity:1,stressMoodResponse:toward(6)}]])
];

DISCOVERY_EVENTS.push(
e('seat','⌂',['앉으려던 자리에 누군가 물건을 두고 자리를 비웠어요.','Someone has left belongings on the seat they wanted.','座ろうとした席に、誰かの荷物が置かれています。'],[
 ['다른 빈자리를 찾아 옮긴다','Find another empty seat','別の空席を探す',{interference:-1,conflictStyle:toward(0)}],
 ['주변에 자리 주인이 있는지 물어본다','Ask whether the person is nearby','持ち主が近くにいるか尋ねる',{socialStyle:1,decisionStyle:-1}],
 ['돌아올 때까지 잠시 서서 기다린다','Wait standing for a little while','戻るまで少し立って待つ',{impulseControl:-1,activityTempo:-1}],
 ['담당자에게 자리를 사용할 수 있는지 확인한다','Ask the person in charge whether the seat is available','担当者に席を使えるか確認する',{planningStyle:1,interference:1}],
 ['계획이 틀어진 것이 신경 쓰여 주변을 서성인다','Pace nearby, bothered by the change of plan','予定が崩れて気になり、周りを歩く',{moodPersistence:1,moodVolatility:1}]]),
e('postcard','✉',['오래된 책 사이에서 짧은 메모 한 장이 떨어졌어요.','A short note falls from an old book.','古い本の間から短いメモが落ちました。'],[
 ['원래 있던 페이지에 곱게 끼워 넣는다','Carefully put it back on the same page','元のページへ丁寧に挟み直す',{neatness:1,perceptionStyle:-1}],
 ['어떤 사람이 썼을지 잠시 상상한다','Imagine who might have written it','どんな人が書いたのか想像する',{perceptionStyle:1,moodPersistence:1}],
 ['주인이 알아볼 수 있도록 책 옆에 놓는다','Place it beside the book for its owner to find','持ち主が気づくよう本の横に置く',{interference:-1,planningStyle:1}],
 ['함께 있는 사람에게 발견한 것을 이야기한다','Tell their companion about the discovery','同行者に見つけたことを話す',{socialStyle:1,emotionalExpression:1}],
 ['별일 아니라 생각하고 하던 일로 돌아간다','Think little of it and return to their task','気に留めず、元の作業に戻る',{moodPersistence:-1,activityTempo:1}]]),
e('scent','❀',['어디선가 익숙한 향기가 잠깐 스쳐 갔어요.','A familiar scent drifts past for a moment.','どこからか懐かしい香りが一瞬漂いました。'],[
 ['향기가 나는 곳을 찾아 천천히 걸어간다','Walk slowly toward the source','香りのする方へゆっくり歩く',{perceptionStyle:1,energyRhythm:1}],
 ['떠오른 기억을 조용히 되짚는다','Quietly revisit the memory it brings','浮かんだ記憶を静かにたどる',{socialStyle:-1,moodPersistence:1}],
 ['곁에 있는 사람에게 무엇인지 물어본다','Ask someone nearby what it is','そばの人に何の香りか尋ねる',{socialStyle:1,perceptionStyle:-1}],
 ['잠깐 미소 짓고 다시 하던 일을 한다','Smile briefly and return to what they were doing','少し微笑み、元の作業に戻る',{moodPersistence:-1,positiveMoodResponse:toward(1)}],
 ['기억이 선명하게 올라와 한동안 움직임을 멈춘다','Pause as the memory comes vividly back','記憶が鮮やかによみがえり、しばらく立ち止まる',{emotionalSensitivity:1,emotionalExpression:-1}]]),
e('announcement','♬',['뜻밖의 안내 방송 때문에 주변 사람들이 웅성거리기 시작했어요.','An unexpected announcement sets people murmuring.','思いがけない放送で、周囲がざわつき始めました。'],[
 ['방송의 마지막 문장까지 듣고 내용을 정리한다','Listen to the end and piece the information together','最後まで聞いて内容を整理する',{decisionStyle:-1,planningStyle:1}],
 ['옆 사람에게 무슨 일인지 조심히 물어본다','Quietly ask the person nearby what is happening','隣の人に何があったのかそっと聞く',{socialStyle:1,stressMoodResponse:toward(5)}],
 ['다른 사람들의 표정을 보며 함께 걱정한다','Look at the others and share their concern','周囲の表情を見て、一緒に心配する',{emotionalContagion:1,emotionalBaseline:toward(14)}],
 ['직접 관련된 내용이 아니면 하던 일을 계속한다','Carry on if the announcement does not concern them','自分に関係なければ作業を続ける',{emotionalContagion:-1,diligence:1}],
 ['복잡해지기 전에 조용한 곳으로 이동한다','Move somewhere quiet before things get crowded','混み合う前に静かな所へ移る',{socialStyle:-1,planningStyle:1}]]),
e('lamp','☼',['사용하려던 조명이 깜빡거리며 켜지지 않아요.','The light they want to use flickers without turning on.','使おうとした照明がちらつき、つきません。'],[
 ['스위치와 연결 상태를 차례대로 살핀다','Check the switch and connections in order','スイッチと接続を順番に確認する',{planningStyle:1,perceptionStyle:-1}],
 ['다른 조명이 있는 곳으로 옮긴다','Move to a place with another light','別の明かりがある所へ移る',{planningStyle:-1,activityTempo:1}],
 ['고칠 수 있는 사람에게 도움을 청한다','Ask someone who can fix it for help','直せる人に助けを求める',{socialStyle:1,stressMoodResponse:toward(5)}],
 ['한숨을 쉬고 잠깐 손을 놓는다','Sigh and leave it alone for a moment','ため息をつき、少し手を止める',{stressMoodResponse:toward(1),moodRecoveryStyle:toward(5)}],
 ['해결될 때까지 방법을 바꿔 가며 시도한다','Try different approaches until it works','直るまで方法を変えて試す',{diligence:1,moodRecoveryStyle:toward(4)}]]),
e('tag','♧',['옷깃에 작은 실밥이 보이는데 약속 시간이 다가와요.','A loose thread catches their eye as an appointment approaches.','服の襟にほつれが見えますが、約束の時間が迫っています。'],[
 ['가위를 찾아 깔끔하게 정리하고 나간다','Find scissors, trim it neatly and leave','はさみを探してきれいに整え、出かける',{neatness:1,planningStyle:1}],
 ['눈에 띄지 않게 접어 두고 시간을 맞춘다','Tuck it out of sight and leave on time','目立たないよう折り込み、時間を守る',{decisionStyle:-1,impulseControl:-1}],
 ['크게 신경 쓰지 않고 그대로 나간다','Leave without worrying much about it','あまり気にせずそのまま出かける',{neatness:-1,moodPersistence:-1}],
 ['곁에 있는 사람에게 잠깐 봐 달라고 부탁한다','Ask someone nearby to take a quick look','そばの人に少し見てほしいと頼む',{socialStyle:1,touchReaction:toward(8)}],
 ['다른 옷으로 갈아입느라 서두른다','Hurry to change into something else','別の服に着替えようと急ぐ',{activityTempo:1,emotionalSensitivity:1}]]),
e('coin','○',['걸어가다가 누군가 떨어뜨린 동전 소리를 들었어요.','While walking, they hear someone drop a coin.','歩いていると、誰かが硬貨を落とす音がしました。'],[
 ['바로 뒤돌아 떨어뜨린 사람을 부른다','Turn around and call to the person immediately','すぐ振り向き、落とした人を呼ぶ',{socialStyle:1,activityTempo:1}],
 ['굴러간 방향을 살펴 손으로 가리켜 준다','Watch where it rolls and point it out','転がった先を見て指で示す',{perceptionStyle:-1,affectionStyle:toward(3)}],
 ['상대가 찾을 때까지 옆에서 조용히 기다린다','Wait quietly nearby while they search','相手が探す間、そばで静かに待つ',{activityTempo:-1,interference:-1}],
 ['주변에 밟히지 않도록 잠깐 길을 비켜 달라고 한다','Ask others to make room so it is not stepped on','踏まれないよう、周囲に少しよけてもらう',{interference:1,socialStyle:1}],
 ['이미 찾는 것을 보고 안심하며 걸음을 이어 간다','See that they found it and continue walking, relieved','見つけた様子を見て安心し、そのまま歩く',{moodPersistence:-1,emotionalContagion:1}]]),
e('newtable','▦',['공용 탁자의 물건 배치가 어제와 달라졌어요.','The arrangement on a shared table has changed since yesterday.','共有テーブルの物の配置が昨日と変わっています。'],[
 ['새 배치에 맞춰 필요한 물건부터 찾는다','Find what they need in the new arrangement','新しい配置で必要な物から探す',{planningStyle:-1,perceptionStyle:-1}],
 ['누가 바꿨는지 물으며 이유를 들어 본다','Ask who changed it and listen to their reasons','誰が変えたのか尋ね、理由を聞く',{socialStyle:1,decisionStyle:1}],
 ['사용하기 편하도록 다시 정리해도 될지 묻는다','Ask whether they can rearrange it for easier use','使いやすく整理し直してよいか尋ねる',{neatness:1,interference:1}],
 ['흥미로운 변화라 생각하고 다른 쓰임새를 떠올린다','Find it interesting and imagine new ways to use it','面白い変化だと思い、別の使い方を考える',{perceptionStyle:1,emotionalBaseline:toward(7)}],
 ['익숙한 물건이 안 보여 한동안 마음이 불편하다','Feel unsettled for a while when familiar things are missing','慣れた物が見つからず、しばらく落ち着かない',{moodPersistence:1,emotionalSensitivity:1}]])
);

expandDiscovery(DISCOVERY_EVENTS);
DISCOVERY_EVENTS.push(...PROFILE_EVENTS);

const motions={early:'ponder',rain:'surprise',parcel:'ponder',spill:'surprise',lost:'ponder',change:'surprise',gift:'bounce',noise:'surprise',queue:'stretch',cat:'wave',compliment:'blush',crowd:'wave',puzzle:'ponder',mistake:'surprise',evening:'sway',silence:'ponder',seat:'stretch',postcard:'sway',scent:'sway',announcement:'surprise',lamp:'bounce',tag:'ponder',coin:'ponder',newtable:'wave'};
for(const q of DISCOVERY_EVENTS)q.animation=motions[q.id]||q.animation;

calibrateDiscovery(DISCOVERY_EVENTS);
