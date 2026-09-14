import {SOURCE_RELATION_LETTERS} from './speech-letter-source.js';
// Reviewed full sentences. Regional voices are light literary adaptations,
// not phonetic impersonations or one-to-one mappings between countries.
export const REVIEWED_STYLE_NAMES={
 '경상도 사투리':['경상도 사투리','Gyeongsang dialect · brisk regional voice','慶尚道方言・歯切れのよい関西風'],
 '전라도 사투리':['전라도 사투리','Jeolla dialect · warm regional voice','全羅道方言・穏やかな中国地方風'],
 '하오체':['하오체','Classical courteous voice','古風な丁寧口調'],
 '풍류 선비체':['풍류 선비체','Easygoing scholar','風流な文人'],
 '재상 선비체':['재상 선비체','Measured statesman','思慮深い宰相']
};
export const reviewedStyle=value=>({'고풍스러운 말투':'하오체','사극 선비 말투':'풍류 선비체','선비체':'재상 선비체'})[value]||value;
export const LETTER_KEYS=['친구','단짝','교제','동거','약혼','결혼','동거해소','결별','이혼','절교','절연','화해','재결합','거리두기','라이벌','가족 맞이'];
export const PUSH_KEYS=['지금','오후','저녁','주말','음식 질문','오늘 일','아침 안부','식사 안부','하루 안부','휴식','잘 자','내일 응원','자신감','수고','선물 제안','선물 선택','일하기 싫음','늦잠','쌓인 일','휴일 기다림','음식','음료'];
const lines=s=>s.trim().split('\n').map(s=>s.trim());
export const REVIEWED_LETTERS={
 '경상도 사투리':{ko:lines(`
{상대}랑 친구 하고 싶다. 먼저 말 걸어 봐도 되겠나?
{상대}는 속 얘기도 편하게 하는 사이다. 단짝으로 지내고 싶다.
{상대}가 자꾸 생각난다. 좋아한다고 말해 볼까?
{상대}랑 같이 살고 싶은데, 니 생각은 어떻노?
{상대}랑 약혼하고 싶다. 오래 생각하고 하는 말이다.
{상대}랑 결혼하고 싶다. 이 사람하고 오래 같이 살고 싶어서.
{상대}랑 한집에 사는 건 이제 힘들다. 따로 지내고 싶다.
{상대}랑 헤어지고 싶다. 붙잡고 있어도 마음이 전 같지가 않다.
{상대}랑 이혼하고 싶다. 쉽게 꺼내는 말 아니다. 많이 생각했다.
{상대}랑은 그만 만나고 싶다. 만나면 부딪히기만 해서 지친다.
{상대}랑 연을 끊고 싶다. 가족이라고 다 참고 살 수는 없더라.
{상대}랑 화해하고 싶다. 내가 먼저 얘기해 볼까?
{상대}랑 다시 만나 보고 싶다. 아직 마음이 남아 있다.
{상대}랑 잠깐 거리를 두고 싶다. 내 마음부터 좀 추슬러야겠다.
{상대}한테는 지고 싶지 않다. 서로 겨뤄 보면 어떻겠노?
{상대}를 가족으로 맞고 싶다. 같이 지낸 정이 큰 것 같다.
`),en:lines(`
I'd like to be friends with {상대}. Shall I go and say hello?
I can tell {상대} anything. I'd like us to be best friends.
I keep thinking about {상대}. Shall I tell them how I feel?
I'd like to share a home with {상대}. What do you reckon?
I want to get engaged to {상대}. I've given it a good deal of thought.
I want to marry {상대}. That's who I'd like to grow old with.
Living with {상대} is getting too hard. I need a place of my own.
I want to break up with {상대}. Staying won't bring the feeling back.
I want a divorce from {상대}. I'm not saying that lightly.
I don't want to keep seeing {상대}. All that fighting has worn me out.
I need to cut ties with {상대}. Being family doesn't make everything bearable.
I'd like to make peace with {상대}. Shall I have a word first?
I'd like to try again with {상대}. The feeling hasn't quite gone.
I need a bit of distance from {상대}. Time to get my head straight.
I don't fancy losing to {상대}. A little friendly rivalry, perhaps?
I'd like to welcome {상대} into the family. We've grown close over time.
`),ja:lines(`
{상대}と友達になりたいねん。こっちから声かけてもええかな。
{상대}には何でも話せるんよ。親友になれたらええな。
{상대}のこと、つい考えてしまうねん。好きやって伝えてみようかな。
{상대}と一緒に暮らしたいんやけど、どう思う？
{상대}と婚約したい。よう考えたうえでの話や。
{상대}と結婚したいねん。この人と長く一緒におりたい。
{상대}と同じ家で暮らすのは、もうしんどい。別々に暮らしたい。
{상대}と別れたいねん。一緒におっても、前の気持ちには戻れへん。
{상대}と離婚したい。軽い気持ちで言うてるんやない。ずっと考えてた。
{상대}とは、もう会うのをやめたい。ぶつかってばかりで疲れてしもた。
{상대}と縁を切りたい。家族やからって、何でも耐えられるわけやない。
{상대}と仲直りしたいねん。先に話しかけてみようかな。
{상대}とやり直してみたい。まだ気持ちが残ってるんよ。
{상대}と少し距離を置きたい。まず自分の気持ちを落ち着けたいねん。
{상대}には負けたくないな。お互い競い合ってみるのもええやろ。
{상대}を家族に迎えたい。一緒に過ごした時間は大きいなあ。
`)},
 '전라도 사투리':{ko:lines(`
{상대}랑 친구가 되고 싶은디. 먼저 말 걸어 봐도 괜찮겄지?
{상대}랑 있으면 참 편혀. 단짝으로 지내면 좋겄어.
{상대}가 좋은가 봐. 마음을 한번 전해 보고 싶은디, 어쩔까?
{상대}랑 같이 살고 싶어. 한집에서 지내면 좋겄다는 생각이 들어.
{상대}랑 약혼하고 싶네. 서두르는 거 아니고, 오래 생각했어.
{상대}랑 결혼하고 싶어. 앞으로도 이 사람 곁에 있고 싶당께.
{상대}랑 같이 사는 게 영 힘드네. 이제 따로 지내고 싶어.
{상대}랑 헤어지고 싶어. 마음이 전 같지 않은 걸 어쩌겄어.
{상대}랑 이혼하고 싶네. 오래 고민했는디, 더는 이렇게 못 살겄어.
{상대}랑은 이제 그만 만나고 싶어. 자꾸 상처만 남네.
{상대}랑 연을 끊고 싶어. 가족이라도 내 마음까지 다 내줄 수는 없제.
{상대}랑 화해하고 싶은디. 내가 먼저 말을 건네 볼까?
{상대}랑 다시 만나 보고 싶어. 아직 마음이 남았네.
{상대}랑 잠깐 거리를 두고 싶어. 서로 숨 돌릴 시간이 필요하겄어.
{상대}를 보면 나도 더 잘하고 싶어져. 좋은 경쟁 상대가 되겄어.
{상대}를 가족으로 맞고 싶어. 피가 안 섞였어도 식구가 될 수 있제.
`),en:lines(`
I'd like to be friends with {상대}. Reckon I could say hello first?
I feel right at home with {상대}. I'd love us to be best friends.
I think I've fallen for {상대}. What do you reckon - shall I tell them?
I'd like to live with {상대}. Sharing a home sounds rather lovely.
I'd like to get engaged to {상대}. No rush; I've thought it through.
I'd like to marry {상대}. I want to be by their side for years to come.
Living with {상대} has become a struggle. I'd like us to live apart.
I'd like to part ways with {상대}. My heart just isn't in it anymore.
I want a divorce from {상대}. I've thought long and hard; I can't go on like this.
I'd rather stop seeing {상대}. We keep leaving each other hurt.
I need to cut ties with {상대}. Family matters, but so does my peace of mind.
I'd like to make things right with {상대}. Shall I reach out first?
I'd like another chance with {상대}. There's still something there.
I'd like a little space from {상대}. We could both do with room to breathe.
{상대} makes me want to do better. We'd make good rivals, I reckon.
I'd like to welcome {상대} as family. Blood isn't the only thing that binds us.
`),ja:lines(`
{상대}と友達になりたいんよ。先に声をかけてみてもええかね。
{상대}とおると、ほんまに落ち着くんよ。親友になれたらええね。
{상대}のことが好きみたいなんよ。気持ちを伝えてみようかね。
{상대}と一緒に暮らしたい。同じ家に帰れたら、ええじゃろうね。
{상대}と婚約したいんよ。急いどるわけじゃなくて、よう考えたんよ。
{상대}と結婚したい。これからも、この人のそばにおりたいけえ。
{상대}と暮らすのがつらくなってきたんよ。別々に暮らしたい。
{상대}と別れたいんよ。気持ちが前とは違うんじゃ。
{상대}と離婚したい。ずっと考えとったけど、このままでは暮らせん。
{상대}とは、もう会うのをやめたいんよ。傷つけ合うばかりじゃけえ。
{상대}と縁を切りたい。家族でも、自分の心まで差し出せんよ。
{상대}と仲直りしたいんよ。こっちから話しかけてみようかね。
{상대}とやり直してみたい。まだ気持ちが残っとるんよ。
{상대}と少し距離を置きたい。お互い、ひと息つく時間が必要じゃね。
{상대}を見ると、自分も頑張ろうと思えるんよ。ええ競争相手になれそうじゃ。
{상대}を家族に迎えたい。血がつながっとらんでも、家族にはなれるけえ。
`)},
 '하오체':{ko:lines(`
{상대}와 벗으로 지내고 싶소. 먼저 말을 건네도 괜찮겠소?
{상대}는 마음을 터놓을 수 있는 사람이오. 가장 가까운 벗으로 지내고 싶소.
{상대}를 마음에 두고 있소. 내 뜻을 전해 볼까 하오.
{상대}와 한집에서 지내고 싶소. 그대 생각은 어떻소?
{상대}와 약혼하고 싶소. 오래 생각한 끝에 내린 뜻이오.
{상대}와 혼인하고 싶소. 앞으로의 날들을 함께하고 싶구려.
{상대}와 한집에서 지내기가 힘드오. 이제 거처를 나누고 싶소.
{상대}와의 연을 여기서 마치고 싶소. 마음이 예전과 같지 않구려.
{상대}와 부부의 연을 정리하고 싶소. 가벼이 꺼내는 말은 아니오.
{상대}와의 왕래를 그만두고 싶소. 서로 상처만 남기는 듯하오.
{상대}와 연을 끊고 싶소. 가족이라는 이유만으로 견디기는 어렵소.
{상대}와 화해하고 싶소. 먼저 손을 내밀어 볼까 하오.
{상대}와 다시 시작하고 싶소. 아직 마음이 남아 있구려.
{상대}와 잠시 거리를 두고 싶소. 마음을 돌아볼 시간이 필요하오.
{상대}와 좋은 경쟁 상대가 되고 싶소. 서로에게 배울 것이 많을 듯하오.
{상대}를 가족으로 맞고 싶소. 함께 쌓아 온 정이 깊구려.
`),en:lines(`
I wish to befriend {상대}. May I make the first approach?
{상대} has my confidence. I would like us to be the closest of friends.
I hold {상대} dear. I am considering telling them so.
I wish to share a home with {상대}. What is your view?
I wish to become engaged to {상대}. I have considered it at length.
I wish to marry {상대} and share the days ahead.
Sharing a home with {상대} has become difficult. I wish to live separately.
I wish to part from {상대}. My feelings are no longer what they were.
I wish to end my marriage to {상대}. I do not say this lightly.
I wish to end my friendship with {상대}. We seem only to hurt each other.
I wish to sever ties with {상대}. Family alone cannot make this bearable.
I wish to make peace with {상대}. Perhaps I should reach out first.
I wish to begin again with {상대}. My affection remains.
I wish to spend some time apart from {상대}. I need to reflect.
I would welcome {상대} as a worthy rival. We have much to learn from one another.
I wish to welcome {상대} as family. Our bond has grown deep.
`),ja:lines(`
{상대}と友になりたいのです。こちらから声をかけてもよろしいか。
{상대}には心を許せます。かけがえのない友になりたいものです。
{상대}を慕っております。この思いを伝えてみようかと。
{상대}と一つ屋根の下で暮らしたいのです。あなたはどうお考えですか。
{상대}と婚約したいのです。長く考えた末の願いです。
{상대}と結婚したいのです。これからの日々を共にしたいと思っております。
{상대}との暮らしがつらくなりました。住まいを分けたいのです。
{상대}との縁を、ここで終えたいのです。心が以前とは違っております。
{상대}と夫婦の縁を解きたいのです。軽々しく申しているのではありません。
{상대}との付き合いを終えたいのです。互いに傷を残すばかりですから。
{상대}と縁を切りたいのです。家族というだけで耐え続けるのは難しいものです。
{상대}と和解したいのです。こちらから手を差し伸べようかと。
{상대}とやり直したいのです。まだ思いが残っております。
{상대}としばらく距離を置きたいのです。心を見つめ直す時が必要です。
{상대}と良き競争相手になりたいものです。互いに学ぶことも多いでしょう。
{상대}を家族に迎えたいのです。共に育んだ情は深いものです。
`)},
 '풍류 선비체':{ko:lines(`
{상대}와 벗이 되고 싶네. 차 한 잔 놓고 이야기부터 나눠 볼까?
{상대}와는 말없이 앉아 있어도 좋더군. 평생 벗이라 불러도 좋겠어.
{상대}만 보면 시 한 수가 떠오르네. 아무래도 마음을 빼앗긴 모양이야.
{상대}와 한집에 살면 어떨까? 뜰에 앉아 계절 바뀌는 걸 함께 보고 싶네.
{상대}와 약혼하고 싶네. 늘 느긋한 나지만, 이 마음만은 분명히 해 두고 싶어.
{상대}와 평생을 함께하고 싶네. 좋은 날도 궂은 날도 나란히 걸으면 좋겠어.
{상대}와 거처를 나누고 싶네. 한 지붕 아래 있다고 마음까지 가까운 건 아니더군.
{상대}와의 인연을 놓아주고 싶네. 억지로 붙든다고 꽃이 다시 피지는 않겠지.
{상대}와 부부의 연을 마치고 싶네. 이 말만큼은 웃어넘길 수가 없구먼.
{상대}와 더는 만나고 싶지 않네. 함께한 뒤 마음이 너무 무거워져.
{상대}와 연을 끊고 싶네. 가족이라는 말에 나를 잃고 싶지는 않아.
{상대}와 화해하고 싶네. 차가 식기 전에 내가 먼저 말을 꺼내 볼까?
{상대}와 다시 만나고 싶네. 지나간 줄 알았던 마음이 아직 머물러 있더군.
{상대}와 잠시 떨어져 지내고 싶네. 멀리서 보아야 보이는 것도 있겠지.
{상대}와 한번 겨뤄 보고 싶네. 이기고 지는 것보다 서로 자극이 될 듯해서.
{상대}를 식구로 맞고 싶네. 함께 돌아올 곳이 있다는 건 좋은 일이잖나.
`),en:lines(`
I'd like to befriend {상대}. Shall we start with tea and a good conversation?
Even silence is pleasant with {상대}. I could happily call them my dearest friend.
{상대} has me composing verses. I fear my heart has rather given itself away.
Imagine sharing a home with {상대}, watching the seasons turn in the garden.
I'd like to get engaged to {상대}. Even a leisurely soul ought to make some things clear.
I'd like to spend my life with {상대}, walking side by side in fair weather and foul.
I'd like a separate home from {상대}. One roof doesn't always bring two hearts closer.
I'd like to let {상대} go. Holding a flower tight won't make it bloom again.
I'd like to end my marriage to {상대}. This is one matter I cannot laugh away.
I'd rather stop seeing {상대}. Each meeting leaves my heart heavier.
I need to cut ties with {상대}. I don't wish to lose myself in the name of family.
I'd like to make peace with {상대}. Perhaps I'll speak before the tea grows cold.
I'd like to see {상대} again. The feelings I thought had left are lingering still.
I'd like some time apart from {상대}. Distance may help us see more clearly.
I'd enjoy a little rivalry with {상대}. We might inspire each other, whatever the result.
I'd like to welcome {상대} into the family. How lovely to have somewhere to return together.
`),ja:lines(`
{상대}と友になりたいねえ。茶でも淹れて、話をしてみようか。
{상대}とは黙って座っていても心地よいのだよ。生涯の友と呼びたいね。
{상대}を見ると詩が浮かぶのだよ。どうやら心を奪われたらしい。
{상대}と一緒に暮らしてみたいねえ。庭で季節の移ろいを眺めながらさ。
{상대}と婚約したいのだよ。のんびり屋の私も、この気持ちは伝えておきたい。
{상대}と生涯を共にしたいね。晴れの日も雨の日も、並んで歩いてゆけたら。
{상대}と住まいを分けたい。同じ屋根の下でも、心が近いとは限らないものだね。
{상대}との縁を手放したいのだよ。握りしめても、花がもう一度咲くわけではないからね。
{상대}と夫婦の縁を終えたい。こればかりは、笑って済ませるわけにはいかなくてね。
{상대}とは、もう会うのをやめたい。会うたびに心が重くなるのだよ。
{상대}と縁を切りたい。家族という言葉の中で、自分を見失いたくないからね。
{상대}と仲直りしたいねえ。茶が冷めぬうちに、こちらから話してみようか。
{상대}とやり直したいのだよ。過ぎ去ったと思った心が、まだ留まっていてね。
{상대}と少し離れていたい。遠くからこそ見えるものもあるだろうね。
{상대}と腕を競ってみたいね。勝敗より、互いの励みになりそうだからさ。
{상대}を家族に迎えたい。同じ場所へ帰れるというのは、良いものではないかね。
`)},
 '재상 선비체':{ko:lines(`
{상대}와 벗으로 지내고자 하네. 서로의 뜻을 알아갈 만한 사람이라 판단했네.
{상대}를 가장 가까운 벗으로 두고 싶네. 오래 지켜보며 신뢰를 쌓아 왔지.
{상대}에게 마음을 전하고자 하네. 내 뜻을 밝히되, 답을 재촉하지는 않을 생각일세.
{상대}와 거처를 함께하고 싶네. 서로의 생활을 충분히 의논한 뒤 결정하고자 하네.
{상대}와 약혼하고자 하네. 약속에 따르는 책임도 함께 헤아리고 있네.
{상대}와 혼인하고자 하네. 함께 살아갈 일을 신중히 생각한 끝에 내린 뜻일세.
{상대}와 거처를 나누고자 하네. 각자의 생활을 지키는 편이 낫겠다고 판단했네.
{상대}와의 관계를 정리하고자 하네. 서로에게 지킬 수 없는 약속을 남기고 싶지 않네.
{상대}와 혼인을 마무리하고자 하네. 더는 이어가기 어렵다는 결론에 이르렀네.
{상대}와의 교류를 멈추고자 하네. 거듭되는 갈등을 그대로 두어서는 안 되겠어.
{상대}와 연을 끊고자 하네. 가족의 도리를 이유로 상처를 묵인할 수는 없네.
{상대}와 화해하고자 하네. 먼저 내 잘못을 돌아보고 대화를 청할 생각일세.
{상대}와 다시 시작하고 싶네. 같은 문제를 되풀이하지 않을 길부터 찾고자 하네.
{상대}와 잠시 거리를 두고자 하네. 감정이 가라앉은 뒤 서로의 뜻을 확인하는 편이 좋겠어.
{상대}와 건전한 경쟁을 해 보고 싶네. 서로의 역량을 높이는 계기가 되리라 보네.
{상대}를 가족으로 맞고자 하네. 이름뿐인 약속이 아니라 책임을 함께할 뜻일세.
`),en:lines(`
I wish to befriend {상대}. They seem someone whose views are worth knowing.
I would like {상대} to be my closest friend. Trust has grown through long acquaintance.
I intend to tell {상대} how I feel, without pressing for an answer.
I wish to live with {상대}. We should discuss our daily lives before deciding.
I wish to become engaged to {상대}. I have considered the responsibilities of that promise.
I wish to marry {상대}. This follows careful thought about our life together.
I wish to live apart from {상대}. It seems the better way to preserve our separate lives.
I wish to end my relationship with {상대}. Neither of us should be bound by promises we cannot keep.
I wish to end my marriage to {상대}. I have concluded that it cannot continue.
I wish to stop seeing {상대}. Repeated conflict cannot simply be left unaddressed.
I wish to cut ties with {상대}. Family duty must not excuse continued harm.
I wish to reconcile with {상대}. I will first consider my own faults, then request a conversation.
I wish to begin again with {상대}, provided we find a way not to repeat our mistakes.
I wish to keep some distance from {상대}. We can speak more clearly once tempers have settled.
I would welcome a fair rivalry with {상대}. It could strengthen us both.
I wish to welcome {상대} as family, with the responsibilities that entails.
`),ja:lines(`
{상대}と友として付き合いたい。互いの考えを知るに値する人物と見ている。
{상대}を最も近い友としたい。長く見守り、信頼を重ねてきたのだ。
{상대}に思いを伝えたい。自らの意志は明かすが、返答を急かすつもりはない。
{상대}と住まいを共にしたい。互いの暮らしについて、十分に話し合ってから決めたいのだ。
{상대}と婚約したい。その約束に伴う責任も、よく考えている。
{상대}と結婚したい。共に歩む生活を慎重に考えた末の意志だ。
{상대}と住まいを分けたい。それぞれの暮らしを守るには、そのほうがよいと判断した。
{상대}との関係を終えたい。守れぬ約束で互いを縛りたくはない。
{상대}との婚姻を終えたい。これ以上続けるのは難しいとの結論に至った。
{상대}との交流をやめたい。繰り返される争いを、そのままにはしておけない。
{상대}と縁を切りたい。家族の務めを理由に、傷つけられることを黙認はできない。
{상대}と和解したい。まず自らの非を省みてから、対話を求めるつもりだ。
{상대}とやり直したい。同じ過ちを繰り返さぬ道を、先に探したいのだ。
{상대}としばらく距離を置きたい。感情が静まってから、互いの意志を確かめるほうがよい。
{상대}と公正に競い合いたい。互いの力を伸ばす機会になるだろう。
{상대}を家族に迎えたい。名ばかりではなく、責任も分かち合う覚悟だ。
`)}
};
export const REVIEWED_PUSH={
 '경상도 사투리':{ko:lines(`
지금 뭐 하면 좋겠노? 니가 하나 골라 봐라.
오후에는 뭐 할까? 집에만 있기는 아깝다.
저녁에 뭐 할지 아직 못 정했다. 니 생각은 어떻노?
이번 주말에는 뭐 할끼고? 같이 정해 보자.
니는 무슨 음식 좋아하노? 다음에 같이 먹자.
오늘 일은 좀 했나? 너무 무리한 건 아니제?
일어났나? 오늘도 천천히 시작해 보자.
밥은 먹었나? 바빠도 끼니는 챙기라.
오늘 하루 어땠노? 힘든 일 있었으면 얘기해라.
오늘은 이만하면 됐다. 좀 쉬어라.
밤이 많이 늦었다. 푹 자고 내일 보자.
내일은 좀 나을 거다. 오늘 일은 오늘에 두고 자라.
니 할 수 있다. 한꺼번에 다 하려 하지 마라.
오늘 욕봤다. 애쓴 거 내가 안다.
{상대}한테 {물건} 선물할까 하는데, 괜찮겠나?
{상대} 줄 선물 좀 같이 골라 줄래?
오늘은 영 일이 손에 안 잡히네. 잠깐 쉬었다 해야겠다.
벌써 아침이가? 조금만 더 누워 있고 싶다.
일이 왜 이래 많노. 하나씩 해 봐야지.
휴일 오려면 아직 멀었나. 좀 느긋하게 있고 싶네.
오늘은 {음식} 먹고 싶다. 니도 생각 있나?
{음료} 한잔 마시면서 쉬고 싶네.
`),en:lines(`
What shall we do now? Go on, pick something.
What about this afternoon? Seems a shame to stay in.
Haven't settled on this evening yet. What do you reckon?
Any plans for the weekend? Let's work something out.
What's your favourite food? We could try it together.
How did the work go today? Didn't overdo it, did you?
Up already? Let's ease into the day.
Have you eaten? Busy or not, make time for a meal.
How was your day? If something's bothering you, say the word.
That's plenty for today. Have a wee rest.
It's getting late. Sleep well; see you tomorrow.
Tomorrow may be better. Leave today's troubles here for the night.
You can do this. Doesn't all have to be done at once.
You worked hard today. I know you did.
Thinking of giving {물건} to {상대}. Sound all right?
Give me a hand choosing a present for {상대}, will you?
Can't get into the work today. I'll take a short break.
Morning already? I'd happily stay here a bit longer.
How did all this work pile up? One thing at a time, then.
How far off is the next day off? I could use a quiet one.
Fancy some {음식} today? I certainly do.
I could do with a {음료} and a sit-down.
`),ja:lines(`
今から何しようか。何か一つ選んでみて。
午後は何しよう？ 家におるだけでは、もったいないなあ。
晩に何するか、まだ決めてへんねん。どう思う？
今度の週末、何する？ 一緒に考えようや。
どんな食べ物が好きなん？ 今度、一緒に食べよう。
今日の仕事は進んだ？ 無理しすぎてへん？
起きたん？ 今日もぼちぼち始めようか。
ご飯は食べた？ 忙しくても、ちゃんと食べや。
今日はどんな一日やった？ しんどいことがあったら聞くで。
今日はもう十分やったよ。少し休み。
だいぶ遅くなったなあ。よう寝て、また明日。
明日は少し良くなるかもしれん。今日のことは置いて、ゆっくり寝よう。
できるよ。いっぺんに全部やろうとせんでええ。
今日もお疲れさん。頑張ったの、ちゃんと知ってるで。
{상대}に{물건}を贈ろうかと思うねんけど、どうかな？
{상대}への贈り物、一緒に選んでくれへん？
今日はどうも仕事が手につかへんなあ。ちょっと休んでからにしよう。
もう朝なん？ もう少し寝転んでいたいわ。
何でこんなに仕事が多いんやろ。一つずつ片づけようか。
次の休み、まだ先かなあ。ゆっくりしたいな。
今日は{음식}が食べたいねん。一緒にどう？
{음료}でも飲みながら、ひと息つきたいな。
`)},
 '전라도 사투리':{ko:lines(`
지금 뭣 하면 좋겄어? 하나 골라 줘 봐.
오후엔 뭘 할까? 날도 좋은디 그냥 보내기는 아깝네.
저녁에는 뭐 하면 좋을까잉? 네 생각도 듣고 싶네.
이번 주말엔 뭐 할까? 같이 정하면 좋겄어.
너는 무슨 음식 좋아혀? 다음에 같이 먹어 보자.
오늘 일은 어땠어? 애썼으면 좀 쉬어야제.
일어났어? 오늘은 기분 좋은 일도 좀 있었으면 좋겄네.
밥은 먹었어? 굶지 말고 챙겨 먹어야제.
오늘 하루 어땠는가? 힘들었으면 잠깐 앉아 봐.
이제 좀 쉬어. 오늘 할 만큼 했구먼.
밤이 깊었네. 편히 자고 내일 보자.
내일은 좋은 일도 있겄지. 오늘 너무 애쓰지 마.
잘할 수 있을 거여. 천천히 해도 괜찮아.
오늘 참 애썼어. 네 수고를 내가 모르겄냐.
{상대}한테 {물건} 선물하면 어떨까? 좋아할 것 같은디.
{상대} 줄 선물, 같이 좀 골라 주겄어?
오늘은 일이 영 손에 안 잡히네. 잠깐 바람이나 쐬고 와야겄어.
벌써 아침이네. 이불 밖으로 나가기가 이렇게 어렵나.
할 일이 자꾸 쌓이는구먼. 급한 것부터 하나씩 해야겄어.
휴일이 얼른 왔으면 좋겄네. 그날은 좀 느긋하게 있고 싶어.
오늘은 {음식} 먹고 싶네. 같이 먹으면 더 좋겄어.
{음료} 한잔 마시고 싶어. 잠깐 쉬었다 하자.
`),en:lines(`
What do you reckon we should do now? Pick something for us.
Any thoughts for the afternoon? Too nice a day to let it slip by.
What shall we do this evening? I'd like to hear your thoughts.
What about the weekend? We could plan it together.
What food do you like? We ought to try it together sometime.
How was work today? If you've had a long one, put your feet up.
Morning! Hope the day has something kind in store for you.
Have you had a bite? Don't go running on an empty stomach.
How was your day? Come and sit a while if it's been a hard one.
Have a rest now. You've done more than enough today.
It's late, isn't it? Sleep well, and I'll see you tomorrow.
Tomorrow might bring something good. Don't wear yourself out tonight.
You'll get there, I reckon. Taking your time is all right.
You put a lot into today. That hasn't gone unnoticed.
Would {물건} make a nice present for {상대}? I think they might like it.
Could you help me choose something for {상대}?
Work isn't coming easily today. A little fresh air might help.
Morning already. Why does leaving a warm bed feel so difficult?
The work keeps piling up. Best start with what's urgent.
Wish that day off would come round. I'd like to take it easy for once.
I'd love some {음식} today. Better still if we share it.
Fancy a {음료}? Let's have a little breather.
`),ja:lines(`
今から何をしようかね。何か一つ選んでみて。
午後はどうしようか。ええ天気じゃし、このまま過ぎるのも惜しいね。
晩は何をしようかね。あなたの考えも聞いてみたいんよ。
今度の週末は何をしよう？ 一緒に決められたらええね。
どんな食べ物が好きなん？ 今度、一緒に食べてみようや。
今日の仕事はどうじゃった？ 頑張ったぶん、少し休まんとね。
起きたん？ 今日はええこともあるとええね。
ご飯は食べた？ お腹を空かせたままじゃいけんよ。
今日はどんな一日じゃった？ 大変じゃったら、少し座っていきんさい。
そろそろ休みんさい。今日はよう頑張ったね。
夜も更けたね。ゆっくり寝て、また明日。
明日はええこともあるじゃろう。今夜は無理せんでね。
きっとできるよ。ゆっくりでも、ええけえね。
今日はほんまにお疲れさま。頑張ったこと、ちゃんと分かっとるよ。
{상대}に{물건}を贈ったらどうかね。喜んでくれそうなんよ。
{상대}への贈り物、一緒に選んでもらえんかね。
今日は仕事が手につかんね。少し外の空気でも吸ってこようか。
もう朝じゃね。布団を出るのは、どうしてこう難しいんかね。
仕事が次々増えるねえ。急ぐものから、一つずつじゃね。
早く休みが来んかね。その日はゆっくり過ごしたいんよ。
今日は{음식}が食べたいね。一緒なら、もっとええね。
{음료}を飲みたいな。少し休んでからにしようや。
`)},
 '하오체':{ko:lines(`
지금 무엇을 하면 좋겠소? 그대 생각을 듣고 싶소.
오후에는 무엇을 하겠소? 함께 정해 봅시다.
저녁을 어찌 보내면 좋겠소? 아직 정하지 못했구려.
이번 주말은 어찌 보내겠소? 좋은 생각이 있으면 들려주시오.
그대는 어떤 음식을 좋아하오? 다음에 함께 먹고 싶소.
오늘 일은 어떠했소? 무리하지는 않았는지 궁금하오.
일어났소? 편안한 아침이 되기를 바라오.
식사는 했소? 바쁘더라도 끼니는 챙기시오.
오늘 하루는 어떠했소? 그대 이야기를 듣고 싶구려.
이제 쉬어도 좋소. 오늘 충분히 애썼소.
밤이 깊었구려. 편히 쉬고 내일 봅시다.
내일은 조금 더 나을 것이오. 오늘은 마음을 내려놓으시오.
그대라면 해낼 수 있소. 서두르지 않아도 괜찮소.
오늘 수고가 많았소. 그대가 애쓴 것을 알고 있소.
{상대}에게 {물건} 선물을 보내려 하오. 괜찮겠소?
{상대}에게 줄 선물을 함께 골라 주겠소?
오늘은 일이 손에 잡히지 않는구려. 잠시 쉬었다 해야겠소.
벌써 아침이오? 이부자리가 유난히 편안하구려.
할 일이 많이 쌓였소. 하나씩 마쳐 봐야겠구려.
휴일이 기다려지는구려. 잠시 느긋하게 지내고 싶소.
오늘은 {음식} 먹고 싶소. 함께 먹으면 어떻겠소?
{음료} 한 잔이 생각나는구려. 잠시 쉬어 갑시다.
`),en:lines(`
What shall we do now? I would value your thoughts.
What shall we do this afternoon? Let us decide together.
How shall we spend the evening? I have yet to decide.
What are your thoughts for the weekend? Do share them with me.
What food do you enjoy? I would like to share a meal with you.
How was your work today? I hope you did not overexert yourself.
Are you awake? May your morning be peaceful.
Have you eaten? Do attend to that, however busy you may be.
How was your day? I would like to hear about it.
You may rest now. You have done enough today.
The night grows late. Rest well; we shall meet tomorrow.
Tomorrow may be kinder. Set your worries aside for tonight.
I believe you can do it. There is no need for haste.
You worked hard today. Your efforts are known to me.
I am thinking of giving {물건} to {상대}. Would that be suitable?
Would you help me choose a gift for {상대}?
Work eludes me today. I shall return to it after a short rest.
Is it morning already? This bed is particularly inviting today.
Much work awaits. I shall attend to it one task at a time.
I find myself looking forward to a day of leisure.
I have a taste for {음식} today. Would you care to join me?
A {음료} would be welcome. Let us pause for a moment.
`),ja:lines(`
今は何をいたしましょう。あなたのお考えを聞きたいのです。
午後は何をしましょうか。共に決めませんか。
夕べをどう過ごしましょう。まだ決めかねております。
今度の週末はいかがいたしましょう。良い案があればお聞かせください。
どのような食べ物がお好きですか。いつか共にいただきたいものです。
今日のお仕事はいかがでしたか。無理をなさらなかったか気になります。
お目覚めですか。穏やかな朝となりますように。
食事は済まされましたか。忙しくても、お忘れなく。
今日はどのような一日でしたか。お話を聞きたいものです。
もう休まれてもよいのです。今日は十分に励まれました。
夜も更けました。安らかに休み、また明日お会いしましょう。
明日は少し良くなるでしょう。今夜は心の荷を下ろしてください。
あなたなら成し遂げられます。急がずともよいのです。
今日はご苦労さまでした。その励みを、私は知っております。
{상대}に{물건}を贈ろうと思うのですが、いかがでしょう。
{상대}への贈り物を、共に選んでいただけますか。
今日は仕事が手につきません。少し休んでから取りかかりましょう。
もう朝ですか。今朝は寝床がことのほか心地よいものです。
仕事が随分とたまりました。一つずつ終えてまいりましょう。
休みの日が待ち遠しいものです。少しのんびりしたいと思っております。
今日は{음식}をいただきたい気分です。ご一緒にいかがですか。
{음료}を一杯いただきたいものです。しばし休みましょう。
`)},
 '풍류 선비체':{ko:lines(`
지금은 무얼 해 볼까? 자네 생각이 내 생각보다 재밌을 듯하네.
오후 볕이 좋구먼. 이 시간을 어찌 보내면 좋겠나?
저녁 바람이 제법 선선하네. 우리 무얼 해 볼까?
주말에는 어디 바람이라도 쐬러 갈까? 자네가 골라 보게.
자네는 무얼 먹을 때 가장 즐거운가? 나도 한번 맛보고 싶네.
오늘 일은 좀 풀렸는가? 안 풀렸다면 차라도 한 잔 하지.
일어났는가? 창밖이 제법 볼 만하네.
끼니는 챙겼나? 좋은 경치도 배가 불러야 눈에 들어오지.
오늘은 어떤 이야기를 주워 왔나? 자네 하루가 궁금하네.
일은 잠시 내려놓게. 빈 시간도 쓸모가 있는 법이지.
이제 잠들어야겠네. 꿈에서라도 좋은 풍경을 보게나.
내일은 또 다른 바람이 불겠지. 오늘 걱정은 여기 두고 가게.
자네는 자네 걸음으로 가면 되네. 남보다 빠를 필요야 있겠나.
오늘 애썼네. 이쯤에서 스스로에게도 다정해지게나.
{상대}에게 {물건} 선물을 보내면 어떨까? 문득 그 사람이 떠올랐네.
{상대} 줄 선물을 같이 골라 보세. 내 안목만 믿기엔 조금 불안해서 말이지.
오늘은 글자도 일도 눈에 안 들어오네. 마음이 먼저 산책을 나간 모양이야.
아침이 벌써 왔나? 이불 속에 좋은 시 한 수쯤 남아 있는 듯한데.
할 일이 제법 쌓였구먼. 차 한 모금 마시고 하나씩 해 보세.
휴일에는 아무 약속도 잡지 않을 생각이네. 느긋할 약속 하나면 충분하지.
오늘은 {음식} 생각이 나네. 풍류도 먹고 나서 즐겨야 하지 않겠나.
{음료} 한 잔 놓고 쉬고 싶네. 잠깐 같이 앉겠나?
`),en:lines(`
What shall we try now? Your idea may be more interesting than mine.
What lovely afternoon light. How shall we spend it?
The evening breeze is rather pleasant. What shall we do?
Shall we wander somewhere this weekend? You choose the path.
What food makes you happiest? I'd like a taste of it myself.
Did work go smoothly? If not, there's always tea.
Awake? The view outside is worth a look.
Have you eaten? Even a fine view improves on a full stomach.
What stories did you gather today? I'd like to hear about your day.
Lay the work aside. Unfilled time has its uses too.
Time to sleep. May your dreams take you somewhere lovely.
A different breeze will blow tomorrow. Leave today's worries here.
Walk at your own pace. Must we always be quicker than someone else?
You worked hard today. Do be a little kind to yourself now.
Would {물건} suit {상대}? It brought them to mind.
Let's choose a gift for {상대}. My taste could use a second opinion.
Neither words nor work will hold my attention. My mind has gone walking without me.
Morning already? There might be a fine verse still hiding in these blankets.
The work has piled up. A sip of tea, then one task at a time.
I've made no plans for my day off. A promise to take it easy will do.
I'd rather like some {음식}. Even a poet needs lunch.
A {음료} and a quiet seat would suit me. Will you join me?
`),ja:lines(`
今は何をしてみようか。君の案のほうが面白そうだね。
午後の日差しがきれいだねえ。この時間をどう過ごそうか。
夕風が心地よいね。さて、何をしようか。
週末はどこかへ風に当たりに行こうか。君が選んでごらん。
何を食べると一番うれしいかね。私も一度味わってみたいな。
今日の仕事は進んだかね。進まなかったなら、茶でも飲もう。
起きたかね。窓の外もなかなか見ものだよ。
ご飯は食べたかい。良い景色も、腹を満たしてから楽しみたいものだね。
今日はどんな話を拾ってきたかね。君の一日が気になるよ。
仕事は少し置いておこう。何もない時間にも、使い道はあるものさ。
そろそろ眠ろうか。夢の中でも、良い景色に会えるといいね。
明日はまた違う風が吹くだろう。今日の心配は、ここに置いておいで。
君の歩幅で進めばよいさ。誰かより速くある必要もないだろう。
今日もお疲れさま。そろそろ自分にも優しくしておあげ。
{상대}に{물건}を贈ってはどうだろう。ふと、あの人を思い出してね。
{상대}への贈り物を一緒に選ぼう。私の目利きだけでは心もとなくてね。
今日は文字も仕事も目に入らないねえ。心が先に散歩へ出たらしい。
もう朝かい。布団の中に、良い詩がまだ一つ残っていそうなのだがね。
仕事が随分たまったね。茶を一口飲んで、一つずつ片づけようか。
休みには何も予定を入れないつもりさ。のんびりする約束だけで十分だよ。
今日は{음식}が食べたいね。風流を楽しむにも、まずは腹ごしらえさ。
{음료}を一杯置いて休みたいね。少し一緒に座らないかい。
`)},
 '재상 선비체':{ko:lines(`
지금 할 일을 정하고자 하네. 자네 의견을 듣겠네.
오후에 무엇을 할지 아직 정하지 못했네. 함께 살펴보겠나?
저녁 시간을 어찌 보낼지 생각 중일세. 좋은 의견이 있으면 말해 주게.
이번 휴일 계획을 세우고자 하네. 자네가 원하는 일도 반영하고 싶네.
자네는 어떤 음식을 좋아하는가? 함께 식사할 때 기억해 두고 싶네.
오늘 맡은 일은 어떠했나? 성과보다 자네가 무리하지 않았는지 궁금하네.
기침했는가? 오늘 할 일은 몸을 깨운 뒤에 살펴도 늦지 않네.
조반은 들었나? 할 일이 많더라도 식사부터 챙기게.
오늘 하루는 어떠했나? 어려웠던 일부터 차근히 이야기해 보게.
지금은 쉬는 편이 좋겠네. 지친 채로 판단을 서두를 이유는 없지.
밤이 깊었네. 오늘 일은 마치고 편히 쉬게.
내일의 일은 내일의 힘으로 풀면 되네. 오늘은 충분히 애썼어.
자네에게는 해낼 역량이 있네. 필요한 도움은 주저 말고 청하게.
오늘 수고가 많았네. 드러나지 않은 노력도 알고 있네.
{상대}에게 {물건} 선물을 보내려 하네. 상대의 취향에도 맞을지 함께 살펴보겠나?
{상대}에게 줄 선물을 골라 주게. 받는 이의 마음을 먼저 생각하고 싶네.
오늘은 집중이 흐트러지는군. 잠시 쉬고 다시 살펴야겠네.
아침이 되었군. 몸이 무거우니 준비를 서두르지는 말아야겠어.
할 일이 많이 쌓였네. 급한 일과 기다릴 수 있는 일을 먼저 나누겠네.
휴일에는 충분히 쉬고 싶네. 다음 일을 준비하는 데도 쉼이 필요하니.
오늘은 {음식} 생각이 나는군. 식사할 때 함께 주문하면 어떻겠나?
{음료} 한 잔 마시며 잠시 쉬겠네. 자네도 함께하겠나?
`),en:lines(`
I would like to decide our next task. Let me hear your view.
The afternoon remains unplanned. Shall we consider the options together?
I am considering how to spend the evening. Your suggestions would be welcome.
I would like to plan the coming day off, including something you would enjoy.
What food do you prefer? I should remember it when we dine together.
How did your work go? More than the result, I hope you have not overexerted yourself.
Are you awake? The day's tasks can wait until you are ready.
Have you had breakfast? Attend to your meal, however much work awaits.
How was your day? Let us begin with whatever proved difficult.
Rest would be wise now. There is no need to make hasty decisions while tired.
It is late. Bring today's work to a close and rest well.
Tomorrow's matters can be met with tomorrow's strength. You have done enough today.
You have the ability to do this. Do not hesitate to request any help you need.
Thank you for your work today. I am aware of the efforts that went unseen.
I intend to give {물건} to {상대}. Shall we consider whether it suits their taste?
Help me choose a gift for {상대}. I wish to keep the recipient's wishes in mind.
My concentration is faltering today. I should rest before looking at this again.
Morning has come. I feel sluggish; it would be best not to rush my preparations.
Much work has accumulated. I shall distinguish the urgent from what can wait.
I hope to rest properly on my day off. That, too, prepares us for what follows.
I am in the mood for {음식}. Shall we order it when we eat?
I shall take a short break over a {음료}. Would you join me?
`),ja:lines(`
次にすることを決めたい。あなたの意見を聞かせてくれたまえ。
午後の予定はまだ定めていない。共に検討してもらえるだろうか。
夕方の時間をどう過ごすか考えている。良い案があれば聞かせてほしい。
今度の休みの計画を立てたい。あなたの望むことも取り入れたいのだ。
どのような食べ物が好きかね。共に食事をする際に覚えておきたい。
今日の仕事はどうだったかね。成果よりも、無理をしなかったかが気になる。
起きたかね。今日の仕事は、身体が目覚めてから見ても遅くはない。
朝食は済ませたかね。仕事が多くても、先に食事を取りたまえ。
今日はどうだったかね。難しかったことから、順に話してみたまえ。
今は休むほうがよい。疲れたまま判断を急ぐ理由はないのだから。
夜も更けた。今日の仕事は終え、ゆっくり休みたまえ。
明日のことは、明日の力で解けばよい。今日は十分に励んだのだ。
あなたには成し遂げる力がある。必要な助けは遠慮なく求めたまえ。
今日もご苦労だった。表に出ない努力も、承知している。
{상대}に{물건}を贈りたい。相手の好みに合うか、共に考えてもらえるだろうか。
{상대}への贈り物を選んでくれたまえ。受け取る人の気持ちを第一に考えたい。
今日は集中が乱れるな。少し休んでから、改めて取り組むとしよう。
朝になったか。身体が重いので、準備を急ぎすぎぬようにしよう。
仕事が多くたまった。急ぐものと待てるものを、まず分けるとしよう。
休みには十分に休養を取りたい。次の仕事に備えるためにも必要だ。
今日は{음식}を食べたい気分だ。食事の際に一緒に頼んではどうかね。
{음료}を一杯飲んで、ひと息つこう。あなたもどうかね。
`)}
};
export function reviewedPush(character,key,{language='ko',target='',item='',food='',drink=''}={}){
 const pool=REVIEWED_PUSH[reviewedStyle(character?.speechStyle)];if(!pool)return '';
 const index=PUSH_KEYS.indexOf(key);if(index<0)return '';
 return (pool[language]||pool.ko)[index].replaceAll('{상대}',target||'…').replaceAll('{물건}',item||'…').replaceAll('{음식}',food||item||'…').replaceAll('{음료}',drink||item||'…');
}
export function relationshipLetterCopy(character,kind,target,lang='ko'){
 const style=reviewedStyle(character?.speechStyle);if(lang==='ko'&&!REVIEWED_LETTERS[style]&&SOURCE_RELATION_LETTERS[style]?.[kind])return SOURCE_RELATION_LETTERS[style][kind].replaceAll('{상대}',target||'…');const pool=REVIEWED_LETTERS[style]||REVIEWED_LETTERS['하오체'];
 return (pool[lang]||pool.ko)[Math.max(0,LETTER_KEYS.indexOf(kind))].replaceAll('{상대}',target||'…');
}
