// Each authored row has Korean, English and Japanese text. No private secret text is interpolated.
const rows=text=>text.trim().split('\n').map(row=>row.split('|'));
export const lifeStories={
quiet:rows(`말을 걸까 하다가 조금 더 혼자 쉬기로 했어요.|They considered starting a conversation, then chose a little more quiet time.|声をかけようか迷い、もう少し一人で休むことにしました。
조용한 틈에 자신의 마음이 어떤지 천천히 살폈어요.|In a quiet moment, they checked in with their own feelings.|静かな時間に、自分の気持ちをゆっくり確かめました。
누군가와 함께하고 싶은 마음과 혼자 있고 싶은 마음이 나란히 머물렀어요.|They wanted company and solitude at the same time.|誰かといたい気持ちと、一人でいたい気持ちが並んでいました。
해야 할 일을 떠올리다가 지금은 서두르지 않기로 했어요.|They thought of their tasks, but decided not to rush this moment.|やることを思い浮かべ、今は急がないことにしました。
별일 없는 시간을 보내며 조금씩 자기 속도를 되찾았어요.|An uneventful moment helped them find their own pace again.|何でもない時間を過ごし、少しずつ自分のペースを取り戻しました。`),
warm:rows(`{name}와 함께 있으니 먼저 말을 꺼내기가 조금 쉬워졌어요.|Being with {name} made it a little easier to speak first.|{name}といると、自分から話しやすくなりました。
{name}에게 하고 싶은 말이 생겼지만 서두르지 않고 틈을 기다렸어요.|They had something to tell {name}, and waited for a natural opening.|{name}に話したいことができ、自然な間を待ちました。
{name} 앞에서는 평소보다 표정이 조금 부드러워졌어요.|Their expression softened a little around {name}.|{name}の前では、表情が少し柔らかくなりました。
짧은 대화여도 {name}와 함께한 시간이 반가웠어요.|Even a brief conversation with {name} felt welcome.|短い会話でも、{name}と過ごせてうれしく感じました。
{name} 곁에 있으니 별다른 이야깃거리가 없어도 괜찮았어요.|They felt fine beside {name}, even without a topic to discuss.|{name}のそばでは、話題がなくても平気でした。`),
shy:rows(`{name}에게 평소처럼 말하려는데 괜히 단어를 고르게 됐어요.|They tried to speak normally to {name}, but kept choosing their words.|{name}にいつも通り話そうとして、つい言葉を選びました。
{name}를 의식한 나머지 손을 어디에 둘지 잠깐 망설였어요.|Aware of {name}, they briefly wondered what to do with their hands.|{name}を意識して、手をどこに置こうか少し迷いました。
{name}와 함께 있는 시간이 조금 더 길었으면 하고 생각했어요.|They wished this time with {name} could last a little longer.|{name}といる時間が、もう少し続けばいいと思いました。
아무렇지 않은 척했지만 {name}에게 시선이 한 번 더 갔어요.|They acted casual, but glanced at {name} once more.|平気なふりをしながら、もう一度{name}を見ました。
{name}에게 건넬 말을 속으로 연습하다가 스스로 조금 부끄러워졌어요.|Rehearsing something to say to {name} made them feel shy.|{name}に言う言葉を心で練習して、少し照れました。`),
tension:rows(`{name}에게 바로 답하기보다 잠깐 생각을 정리했어요.|They gathered their thoughts before answering {name}.|{name}に答える前に、少し考えを整理しました。
{name}와의 대화가 날카로워지지 않도록 말을 천천히 골랐어요.|They chose words slowly to keep the exchange with {name} from turning sharp.|{name}との会話が険しくならないよう、ゆっくり言葉を選びました。
{name} 앞에서 마음이 편하지 않아 잠깐 거리를 두고 싶었어요.|Uneasy around {name}, they wanted a little space.|{name}の前では落ち着かず、少し距離が欲しくなりました。
{name}에게 할 말이 있었지만 지금이 적당한 때인지 고민했어요.|They had something to tell {name}, but wondered whether this was the right moment.|{name}に言いたいことがあり、今がよい時か考えました。
{name}와 생각이 다를 수 있다는 걸 떠올리며 숨을 골랐어요.|They took a breath, remembering that {name} might see things differently.|{name}とは考えが違うかもしれないと、呼吸を整えました。`),
trust:rows(`{name} 앞에서는 괜찮은 척하려고 애쓰지 않아도 될 것 같았어요.|Around {name}, they felt less need to pretend everything was fine.|{name}の前なら、無理に平気なふりをしなくてもよさそうでした。
{name}에게는 생각이 정리되지 않은 채 말해도 괜찮을 것 같았어요.|They felt they could speak to {name} before finding perfect words.|{name}には、考えがまとまる前でも話せそうでした。
{name}와 함께 있으니 침묵을 급히 채우려 하지 않았어요.|With {name}, they did not rush to fill the silence.|{name}といると、沈黙を急いで埋めようとはしませんでした。
{name}에게 작은 고민부터 이야기해 볼까 생각했어요.|They considered telling {name} a small concern first.|{name}に、小さな悩みから話そうかと思いました。
{name}와는 말이 조금 서툴러도 다시 설명할 수 있을 것 같았어요.|With {name}, they felt they could explain again if their words came out awkwardly.|{name}には、言い方が不器用でも説明し直せそうでした。`),
memory:rows(`앞서 {name}와 함께했던 순간을 잠깐 떠올렸어요.|They briefly recalled the earlier moment with {name}.|先ほど{name}と過ごした時間を、ふと思い出しました。
{name}와 나눈 시간의 여운이 혼자 있는 동안에도 남았어요.|The feeling of their time with {name} lingered while they were alone.|{name}と過ごした余韻が、一人の時間にも残りました。
다음에 {name}를 만나면 어떤 말을 할지 생각했어요.|They thought about what to say when they next met {name}.|次に{name}に会ったら何を話そうかと考えました。
{name}와의 짧은 만남이 생각보다 오래 마음에 남았어요.|A brief moment with {name} stayed with them longer than expected.|{name}との短い時間が、思ったより長く心に残りました。
{name}와 함께 있을 때의 자신을 떠올리며 작은 미소를 지었어요.|Remembering how they felt with {name}, they smiled a little.|{name}といた時の自分を思い出し、少し微笑みました。`),
boundary:rows(`{name}와 친해지고 싶지만 자신의 속도도 지키고 싶었어요.|They wanted to grow closer to {name} without losing their own pace.|{name}と親しくなりつつ、自分のペースも守りたく思いました。
{name}에게 모든 이야기를 한꺼번에 할 필요는 없다고 생각했어요.|They reminded themselves they did not have to tell {name} everything at once.|{name}に一度に全部話さなくてもよいと思いました。
{name}와 가까이 있어도 혼자 정리할 마음은 남겨 두었어요.|Even beside {name}, they kept some feelings to reflect on privately.|{name}のそばでも、一人で整理する気持ちは残しました。
{name}에게 맞추기 전에 자신이 편안한지도 살폈어요.|Before adjusting to {name}, they checked whether they felt comfortable too.|{name}に合わせる前に、自分も心地よいか確かめました。
{name}와의 관계를 서두르지 않고 조금씩 알아가기로 했어요.|They chose to get to know {name} gradually rather than rush the relationship.|{name}との関係を急がず、少しずつ知っていこうと思いました。`),
relief:rows(`이야기를 나눈 뒤에도 마음을 정리할 시간은 조금 필요했어요.|Even after sharing, they needed a little time to process their feelings.|話した後も、気持ちを整理する時間が少し必要でした。
말로 꺼냈던 마음이 아직 선명하게 남아 있었어요.|The feelings they had put into words were still vivid.|言葉にした気持ちが、まだ鮮明に残っていました。
이야기를 끝냈다고 모든 감정이 바로 사라지는 건 아니었어요.|Finishing the conversation had not made every feeling disappear.|話し終えても、すべての感情がすぐ消えるわけではありませんでした。
누군가에게 털어놓았던 순간을 돌아보며 천천히 숨을 쉬었어요.|They breathed slowly while reflecting on the moment of sharing.|打ち明けた時間を振り返りながら、ゆっくり息をしました。
자신이 어디까지 이야기했는지 돌아보고 다음에는 천천히 이어 가기로 했어요.|They reflected on how much they had shared and decided to continue at their own pace.|どこまで話したか振り返り、続きは自分のペースで話そうと思いました。`)
};
export const secretStories={
trauma:rows(`지금 편안하게 머물 수 있는 거리를 스스로 확인했어요.|They checked what distance felt comfortable right now.|今、安心できる距離を自分で確かめました。
과거를 설명하지 않아도 잠시 쉴 수 있다고 자신에게 말했어요.|They reminded themselves they could rest without explaining their past.|過去を説明しなくても休んでいいと、自分に言いました。
괜찮아지려고 서두르기보다 익숙한 호흡을 되찾으려 했어요.|Instead of rushing to feel better, they found a familiar breathing rhythm.|早く平気になろうとせず、慣れた呼吸を取り戻そうとしました。
떠오르는 생각을 억지로 밀어내지 않고 지금 있는 곳을 살폈어요.|They noticed their surroundings without forcing thoughts away.|浮かぶ思いを無理に追い払わず、今いる場所を確かめました。`),
identity:rows(`남들에게 보이는 모습과 혼자 아는 자신 사이의 거리를 생각했어요.|They considered the distance between their public face and private self.|人に見せる顔と、自分だけが知る自分との距離を考えました。
평소의 말투 속에 감춰 둔 버릇이 드러나지 않도록 잠시 신경 썼어요.|They briefly took care not to reveal a habit they kept hidden.|隠している癖が普段の話し方に出ないよう、少し気を配りました。
자신을 어디까지 설명할 수 있을지 속으로 가늠했어요.|They privately considered how much of themselves they could explain.|自分のことをどこまで説明できるか、心の中で考えました。
숨긴 모습도 자신의 일부라는 생각이 문득 들었어요.|It occurred to them that their hidden side was part of them too.|隠している姿も自分の一部なのだと、ふと思いました。`),
relationship:rows(`남들이 모르는 인연을 떠올리며 말을 하나 삼켰어요.|Thinking of a connection others did not know, they held back a word.|人の知らない縁を思い出し、言葉を一つ飲み込みました。
겉으로 보이는 관계만으로 설명할 수 없는 마음이 있었어요.|Some feelings could not be explained by the relationship others saw.|表に見える関係だけでは説明できない気持ちがありました。
그 인연을 언제 이야기할지는 스스로 정하고 싶었어요.|They wanted to choose for themselves when to explain that connection.|その縁をいつ話すかは、自分で決めたいと思いました。
숨겨 둔 관계를 생각하다가 지금 하던 일로 천천히 돌아왔어요.|After thinking about a hidden connection, they slowly returned to the present task.|隠している関係を考え、ゆっくり今の作業に戻りました。`),
goal:rows(`아직 말하지 않은 바람을 위해 오늘 할 수 있는 작은 일을 생각했어요.|They considered a small step toward a wish they had not shared.|まだ話していない願いのため、今日できる小さなことを考えました。
속으로 품은 목표와 지금의 생활 사이에서 잠시 고민했어요.|They weighed their private goal against their present life.|胸に秘めた目標と今の暮らしの間で、少し迷いました。
바라는 미래를 떠올렸다가 너무 서두르지 않기로 했어요.|They pictured the future they wanted, then chose not to rush.|望む未来を思い描き、急ぎすぎないことにしました。
아무에게도 약속하지 않았지만 자신의 바람은 잊지 않았어요.|They had promised no one, but had not forgotten their own wish.|誰にも約束していなくても、自分の願いは忘れていませんでした。`),
preference:rows(`남들의 취향에 맞장구치기 전에 자신의 마음을 살폈어요.|Before agreeing with others' tastes, they checked their own feelings.|人の好みに同意する前に、自分の気持ちを確かめました。
좋고 싫음을 모두 설명하지 않아도 괜찮다고 생각했어요.|They felt they did not need to explain every like and dislike.|好き嫌いをすべて説明しなくてもよいと思いました。
혼자만 알고 있는 취향을 떠올리며 조금 마음이 편해졌어요.|Remembering a private preference brought a little comfort.|自分だけが知る好みを思い出し、少し心が和らぎました。
다음에는 자신의 취향을 조금만 더 솔직하게 말해 볼까 생각했어요.|They considered being a little more honest about their tastes next time.|次は好みを少しだけ素直に話そうかと思いました。`),
custom:rows(`아직 꺼내지 않은 이야기를 마음 한쪽에 남겨 두었어요.|They kept an untold story in a corner of their mind.|まだ話していないことを、心の片隅に残しました。
비밀을 말할지보다 지금 말하고 싶은지를 먼저 생각했어요.|Before deciding to reveal a secret, they asked whether they wanted to speak now.|秘密を明かすかより、今話したいかを先に考えました。
자신만 아는 생각을 잠시 떠올렸다가 일상으로 돌아왔어요.|They briefly recalled a private thought, then returned to daily life.|自分だけの思いを浮かべ、日常に戻りました。
이야기의 일부를 마음속에서 정리했지만 아직 말로 옮기지는 않았어요.|They organized part of the story in their mind without voicing it yet.|話の一部を心で整理しましたが、まだ口にはしませんでした。`)
};
export const rankStories={
sovereign:rows(`자신의 짧은 한마디가 명령으로 받아들여질 수 있어 말을 골랐어요.|They chose words carefully, aware that a passing remark could sound like an order.|何気ない一言が命令になり得るため、言葉を選びました。
군주라는 호칭 뒤에 가려지는 개인의 마음을 잠시 돌아봤어요.|They reflected on the private feelings hidden behind the title of sovereign.|君主という呼び名の陰に隠れる、自分の気持ちを振り返りました。
모두의 시선을 받는 자리에서도 혼자 생각할 틈을 찾고 싶었어요.|Even under everyone's gaze, they wanted a moment to think alone.|皆の視線を受ける立場でも、一人で考える時間が欲しくなりました。
권위 있게 보이는 것과 솔직하게 말하는 것 사이에서 망설였어요.|They hesitated between appearing authoritative and speaking honestly.|威厳を保つことと率直に話すことの間で迷いました。`),
royalty:rows(`왕족으로서의 예절이 몸에 배어 편한 자리에서도 자세를 고쳤어요.|Royal etiquette was so familiar that they adjusted their posture even at ease.|王族の作法が身についていて、気楽な時にも姿勢を直しました。
가문의 기대와 자신의 바람이 같은 방향인지 생각했어요.|They wondered whether their family's expectations matched their own wishes.|家の期待と自分の願いが同じ方向なのか考えました。
이름보다 신분이 먼저 소개되는 일에 잠깐 씁쓸해졌어요.|They felt a brief pang at being introduced by rank before name.|名前より先に身分を紹介されることに、少し寂しさを感じました。
평범한 친절에도 격식을 따져야 하는지 속으로 고민했어요.|They wondered whether even simple kindness needed formal ceremony.|何気ない親切にも格式が必要なのか、心で考えました。`),
duke:rows(`높은 작위만큼 자신의 태도가 남들에게 어떻게 보일지 신경 썼어요.|Their high title made them consider how others might read their manner.|高い爵位ゆえに、自分の態度がどう見えるか気にかけました。
가문의 체면을 지키면서도 자신의 의견을 숨기고 싶지는 않았어요.|They wanted to uphold family dignity without hiding their own opinion.|家の面目を保ちながらも、自分の意見は隠したくありませんでした。
공작이라는 호칭 없이 대화한다면 어떨지 잠시 상상했어요.|They briefly imagined a conversation without the title of duke.|公爵という呼び名なしで話したらどうなるか、少し想像しました。
익숙한 대우를 당연하게 여기지 않으려고 주변을 살폈어요.|They tried not to take familiar deference for granted.|慣れた待遇を当たり前と思わないよう、周囲に目を向けました。`),
marquis:rows(`격식을 지키면서도 대화가 너무 멀어지지 않도록 말을 골랐어요.|They chose words that preserved formality without creating too much distance.|格式を守りながら、距離が開きすぎない言葉を選びました。
자신의 작위와 상대의 호칭을 나란히 생각했어요.|They considered their own title alongside the other person's form of address.|自分の爵位と相手の呼び名を並べて考えました。
공적인 태도와 사적인 친절을 어디서 나눌지 고민했어요.|They considered where public manners ended and private kindness began.|公の態度と私的な親切の境目を考えました。
가문을 대표하는 말과 개인의 생각이 다를 때를 떠올렸어요.|They reflected on how a family's position could differ from a private opinion.|家を代表する言葉と個人の思いが異なる時を考えました。`),
count:rows(`격식 있는 인사를 떠올리다가 조금 더 자연스러운 말을 골랐어요.|They considered a formal greeting, then chose more natural words.|格式ある挨拶を考え、少し自然な言葉を選びました。
백작이라는 위치가 주는 편리함과 부담을 함께 생각했어요.|They considered both the ease and burden of being a count.|伯爵という立場の便利さと重さを、両方考えました。
작위만으로 상대를 판단하지 않으려고 말을 끝까지 들으려 했어요.|They tried to hear others out rather than judge by title alone.|爵位だけで判断せず、相手の話を最後まで聞こうと思いました。
예의를 차린 거리 안에서도 개인적인 마음을 전할 방법을 생각했어요.|They sought a way to express personal feelings within polite distance.|礼儀を保つ距離の中でも、気持ちを伝える方法を考えました。`),
viscount:rows(`높은 신분 앞에서만 태도가 달라지지 않도록 자신을 살폈어요.|They checked that their manner did not change only for higher ranks.|高い身分の前でだけ態度を変えていないか、自分を振り返りました。
작위에 맞는 태도를 생각하다가 어깨의 힘을 조금 풀었어요.|Thinking of proper bearing for their title, they relaxed their shoulders a little.|爵位に合う振る舞いを考え、少し肩の力を抜きました。
격식과 친근함 중 무엇이 지금 필요한지 고민했어요.|They considered whether the moment needed formality or friendliness.|今必要なのは格式か親しみかと考えました。
자신의 말을 상대가 신분 때문에 참는 것은 아닌지 신경 썼어요.|They wondered whether others held back only because of their rank.|相手が身分のために言葉を飲み込んでいないか気になりました。`),
baron:rows(`작위로 얻은 자리에서도 자신의 말로 인정받고 싶었어요.|Even in a place granted by title, they wanted their own words to matter.|爵位で得た場所でも、自分の言葉で認められたいと思いました。
격식에 어긋날까 걱정하다가 할 말을 차분히 정리했어요.|Worried about etiquette, they calmly gathered what they wanted to say.|作法を外れないか気にしつつ、言いたいことを整理しました。
남작이라는 호칭이 가까워지고 싶은 마음을 가리지 않길 바랐어요.|They hoped the title of baron would not hide a wish for closeness.|男爵という呼び名が、親しくなりたい心を隠さないよう願いました。
높은 사람에게 보일 모습보다 자신의 기준을 먼저 생각하려 했어요.|They tried to consider their own principles before appearances before superiors.|目上への見栄えより、自分の基準を先に考えようとしました。`),
gentry:rows(`격식을 익히면서도 자신에게 익숙한 말투를 잃고 싶지는 않았어요.|They wanted to learn etiquette without losing their familiar voice.|作法を学びつつ、自分らしい話し方は失いたくありませんでした。
어느 쪽에도 완전히 속하지 않는 듯한 느낌을 잠시 돌아봤어요.|They reflected on feeling not entirely at home on either side.|どちらにも完全には属さないような気持ちを、少し振り返りました。
호칭 하나를 고르면서도 상대와의 거리를 생각했어요.|Even choosing a form of address made them consider the distance between them.|呼び名を一つ選ぶにも、相手との距離を考えました。
신분을 설명하는 것보다 자신을 알아주는 대화를 바랐어요.|They wanted a conversation that understood them beyond their status.|身分の説明より、自分を知ってもらえる会話を望みました。`),
commoner:rows(`신분이 다른 사람 앞에서도 자신의 생각을 잃지 않으려 했어요.|They tried to hold on to their own thoughts before someone of another rank.|身分の違う人の前でも、自分の考えを失わないようにしました。
예의를 지키는 것과 무조건 따르는 것은 다르다고 생각했어요.|They felt that courtesy and unquestioning obedience were different things.|礼儀を守ることと、何でも従うことは違うと思いました。
호칭보다 이름으로 편하게 불리는 순간을 바랐어요.|They wished for a moment of being addressed comfortably by name.|肩書きより名前で気楽に呼ばれる時間を望みました。
높은 신분을 의식하다가 자신이 잘 아는 일에 마음을 돌렸어요.|After noticing rank, they turned their thoughts to something they knew well.|高い身分を意識した後、自分の得意なことに気持ちを戻しました。`)
};
