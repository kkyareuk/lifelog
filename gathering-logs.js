// Authored social moments, selected deterministically per schedule/time slot.
export const SOCIAL_LOGS={
 talk:[
 {id:'talk-topic',copy:['{a}이 최근 관심사를 꺼내자 {b}이 아는 이야기를 보태요. 대화가 예상 밖의 방향으로 이어져요.','{a} mentions a recent interest and {b} adds something they know. The conversation takes an unexpected turn.','{a}が最近の関心事を話すと、{b}が知っている話を添えます。会話は意外な方向へ続きます。']},
 {id:'talk-misheard',copy:['{b}이 말을 잘못 듣고 엉뚱하게 답해요. {a}은 다시 설명하다가 함께 웃음을 터뜨려요.','{b} mishears and gives an unexpected answer. While explaining again, {a} starts laughing with them.','{b}が聞き違えて予想外の返事。{a}は説明し直すうち、一緒に笑い出します。']},
 {id:'talk-question',copy:['{a}은 듣고 있던 이야기의 뒷부분이 궁금해요. {b}은 잠시 생각한 뒤 자세히 들려줘요.','{a} wants to hear how the story ends. {b} thinks for a moment, then fills in the details.','{a}は話の続きが気になります。{b}は少し考えてから、詳しく話してくれます。']},
 {id:'talk-pause',copy:['이야기가 잠시 끊겼어요. {a}이 주변을 둘러보는 동안 {b}은 다음 말을 천천히 골라요.','The conversation pauses. As {a} looks around, {b} takes time to find their next words.','会話が少し途切れました。{a}が辺りを見回す間、{b}は次の言葉をゆっくり選びます。']},
 {id:'talk-different',copy:['같은 이야기를 듣고도 {a}과 {b}의 생각은 달라요. 서로 이유를 묻다가 뜻밖의 공통점을 찾아요.','{a} and {b} see the same story differently. Asking why, they discover unexpected common ground.','同じ話でも{a}と{b}の考えは違います。理由を聞くうちに意外な共通点が見つかります。']}
 ],
 cook:[
 {id:'cook-taste',copy:['{a}이 조금 맛보고 고개를 갸웃해요. {b}도 한입 먹어본 뒤 무엇을 더 넣을지 함께 고민해요.','{a} tastes a little and tilts their head. {b} tries it too, and they consider what to add.','{a}が少し味見して首をかしげます。{b}も一口食べ、何を足すか一緒に考えます。']},
 {id:'cook-shapes',copy:['{a}은 간식의 모양을 가지런히 맞춰요. {b}이 만든 것은 제각각이라 나란히 놓고 비교해 봐요.','{a} makes neatly shaped snacks. {b} makes all sorts of shapes, and they line them up to compare.','{a}はおやつの形をきれいに整えます。{b}の形はさまざまで、並べて比べてみます。']},
 {id:'cook-help',copy:['{b}이 두 손을 다 쓰고 있자 {a}이 옆에서 그릇을 잡아줘요. 말하지 않아도 손이 맞아요.','When both of {b}’s hands are busy, {a} holds the bowl. They work together without a word.','{b}の両手がふさがると、{a}が隣で器を支えます。言わなくても息が合います。']},
 {id:'cook-wait',copy:['간식이 완성되기를 기다리며 {a}과 {b}은 사용한 도구부터 정리해요. 기다리는 동안 수다가 붙어요.','Waiting for the snack to be ready, {a} and {b} put away the utensils and start chatting.','おやつができるのを待ちながら、{a}と{b}は道具を片づけ、おしゃべりを始めます。']},
 {id:'cook-share',copy:['{a}이 완성한 간식을 나눠 놓아요. {b}은 가장 작은 조각을 집었다가 하나 더 권유받아요.','{a} divides up the finished snack. {b} takes the smallest piece and is offered another.','{a}ができたおやつを分けます。{b}は一番小さいものを取り、もう一つどうぞと勧められます。']}
 ],
 game:[
 {id:'game-rule',copy:['규칙을 서로 다르게 알고 있었어요. {a}과 {b}은 이번 판에 쓸 규칙부터 맞춰 봐요.','They learned different rules. {a} and {b} agree which version to use for this round.','二人が知るルールは少し違いました。{a}と{b}は今回のルールを相談します。']},
 {id:'game-risk',copy:['{a}이 과감하게 승부를 걸어요. {b}은 놀란 표정으로 판을 다시 살펴봐요.','{a} makes a bold move. Surprised, {b} takes another look at the board.','{a}が大胆な勝負に出ます。{b}は驚いた顔で盤面を見直します。']},
 {id:'game-think',copy:['{b}이 다음 수를 오래 고민해요. {a}은 재촉하지 않고 자기 말들을 만지작거리며 기다려요.','{b} thinks carefully about the next move. {a} waits, fiddling with their own pieces.','{b}は次の一手をじっくり考えます。{a}は急かさず、自分の駒を触りながら待ちます。']},
 {id:'game-near',copy:['아주 작은 차이로 승부가 났어요. {a}과 {b}은 아쉬웠던 순간을 되짚으며 다음 판을 준비해요.','The game ends by the narrowest margin. {a} and {b} revisit the close moments and prepare another round.','ほんの少しの差で勝負が決まりました。{a}と{b}は惜しかった瞬間を振り返り、次の準備をします。']},
 {id:'game-luck',copy:['뜻밖의 행운에 {b}이 먼저 웃어요. {a}은 믿기지 않는다는 듯 고개를 저으며 웃어요.','An unexpected stroke of luck makes {b} laugh. {a} shakes their head in disbelief and laughs too.','思いがけない幸運に{b}が笑います。{a}も信じられないと首を振りながら笑います。']}
 ],
 movie:[
 {id:'movie-choice',copy:['{a}과 {b}이 보고 싶은 것이 달라요. 서로 소개한 내용을 듣고 둘 다 궁금한 것을 골라요.','{a} and {b} want to watch different things. After hearing each other out, they find one that interests both.','{a}と{b}は見たいものが違います。互いの紹介を聞いて、二人とも気になるものを選びます。']},
 {id:'movie-laugh',copy:['{a}이 먼저 웃자 {b}도 뒤늦게 웃음을 터뜨려요. 놓친 부분을 다시 돌려 보며 더 웃어요.','{a} laughs first and {b} catches on. Replaying the part they missed makes them laugh again.','{a}が先に笑い、{b}も少し遅れて笑い出します。見逃した部分を戻して、また笑います。']},
 {id:'movie-guess',copy:['{b}이 다음 내용을 예상해 봐요. {a}은 다른 결말을 떠올리며 끝까지 지켜봐요.','{b} guesses what comes next. {a} has a different ending in mind and keeps watching.','{b}が続きを予想します。{a}は別の結末を思い浮かべ、最後まで見守ります。']},
 {id:'movie-silence',copy:['흥미로운 대목이 나오자 둘 다 조용해져요. {a}과 {b}은 영상이 끝나고 나서야 감상을 나눠요.','An interesting part makes them both fall silent. {a} and {b} share their thoughts only after it ends.','気になる場面になると二人とも静かに。{a}と{b}は終わってから感想を話します。']},
 {id:'movie-detail',copy:['{a}이 작은 배경 소품을 알아봤어요. {b}은 미처 못 봤다며 화면을 가까이 살펴요.','{a} recognizes a small prop in the background. {b}, who missed it, takes a closer look.','{a}が背景の小物に気づきました。見逃していた{b}は画面をよく見ます。']}
 ],
 comfort:[
 {id:'care-seat',copy:['{a}은 {b}이 편하게 앉을 자리를 비워줘요. {b}은 작은 고개짓으로 고마움을 전해요.','{a} makes room for {b} to sit comfortably. {b} gives a small nod of thanks.','{a}は{b}が楽に座れるよう場所を空けます。{b}は小さくうなずいてお礼を伝えます。']},
 {id:'care-listen',copy:['{b}이 말을 고르는 동안 {a}은 가만히 기다려요. 서두르지 않으니 이야기가 조금 더 이어져요.','{a} waits quietly while {b} finds the words. Without being rushed, the story continues.','{b}が言葉を選ぶ間、{a}は静かに待ちます。急がないことで話がもう少し続きます。']},
 {id:'care-break',copy:['{a}이 잠깐 쉬자고 해요. {b}도 하던 일을 내려놓고 함께 숨을 돌려요.','{a} suggests a short break. {b} sets things down and takes a breather with them.','{a}が少し休もうと声をかけます。{b}も手を止め、一緒にひと息つきます。']},
 {id:'care-remember',copy:['{a}은 전에 {b}이 좋아한다고 했던 것을 기억해요. 뜻밖에 기억해 준 것이 반가운지 {b}이 웃어요.','{a} remembers something {b} once said they liked. Pleased to be remembered, {b} smiles.','{a}は前に{b}が好きだと言ったものを覚えています。覚えていてくれたのがうれしくて{b}は笑います。']},
 {id:'care-small',copy:['{b}이 흘린 것을 {a}이 주워 건네요. 짧게 고맙다는 말을 나누고 다시 편하게 시간을 보내요.','{a} picks up something {b} dropped. After a quick thank-you, they settle back into spending time together.','{a}が{b}の落とし物を拾って渡します。短くお礼を交わし、また気楽に過ごします。']}
 ]};
