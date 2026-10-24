// Paired viewpoints: higher rank first; equal ranks use stable character ID order.
// Every row contains two matching perspectives, each Korean/English/Japanese.
const pair=(a,b)=>[a.split('|'),b.split('|')];
export const courtEncounterCopy={
formal:[
pair('{name}에게 예를 갖춘 인사를 받고, 같은 격식으로 답했어요.|They received a formal greeting from {name} and replied with equal courtesy.|{name}の丁寧な挨拶に、礼を尽くして答えました。','{name}에게 호칭을 갖춰 인사했고, 정중한 답을 들었어요.|They greeted {name} with the proper title and received a courteous reply.|{name}に敬称を添えて挨拶し、丁寧な返事を受けました。'),
pair('{name}의 말을 끝까지 들은 뒤 차분히 답을 건넸어요.|They heard {name} out before answering calmly.|{name}の話を最後まで聞き、落ち着いて答えました。','{name} 앞에서 말을 고르다가, 상대가 기다려 주자 끝까지 이야기했어요.|They chose their words around {name}, then finished as the other waited.|{name}の前で言葉を選び、待ってもらえたので最後まで話しました。')],
equal:[
pair('{name}와 서로의 호칭을 확인하고 편안한 대화의 선을 맞췄어요.|They checked forms of address with {name} and agreed on a comfortable tone.|{name}と呼び方を確かめ、心地よい話し方を合わせました。','{name}와 동등한 입장에서 말투를 맞추며 이야기를 시작했어요.|They began talking with {name} as equals, matching their tone.|{name}と対等な立場で話し方を合わせ、会話を始めました。'),
pair('{name}에게 먼저 의견을 물었고, 번갈아 생각을 이야기했어요.|They asked for {name}’s opinion first, then took turns sharing thoughts.|まず{name}の意見を尋ね、交互に考えを話しました。','{name}의 질문에 생각을 전하고, 상대의 의견에도 귀를 기울였어요.|They answered {name}’s question and listened to the other’s view.|{name}の問いに考えを伝え、相手の意見にも耳を傾けました。')],
close:[
pair('{name}와 신분 이야기는 잠시 접어 두고 익숙한 농담을 나눴어요.|They set rank aside for a moment and traded familiar jokes with {name}.|{name}と身分の話をしばし置いて、なじみの冗談を交わしました。','{name}가 익숙한 농담으로 말을 걸자, 긴장을 풀고 웃으며 답했어요.|A familiar joke from {name} helped them relax and answer with a smile.|{name}のなじみの冗談に緊張がほぐれ、笑って答えました。'),
pair('{name}의 이야기에 직함 대신 이름을 부르며 답했어요.|They answered {name} by name rather than by title.|{name}の話に、肩書きではなく名前を呼んで答えました。','{name}가 이름을 불러 주자, 가까운 사이임을 느끼며 이야기를 이어 갔어요.|Hearing {name} use their name, they felt close and kept talking.|{name}に名前を呼ばれ、親しさを感じながら話を続けました。')],
candid:[
pair('{name}에게 신분보다 의견이 궁금하다고 말하고 솔직한 답을 들었어요.|They told {name} they cared more about the opinion than rank, and heard a candid reply.|{name}に身分より意見を聞きたいと伝え、率直な答えを聞きました。','{name}가 의견을 편하게 말해 달라고 하자, 생각을 솔직하게 전했어요.|Invited by {name} to speak freely, they shared their honest thoughts.|{name}に気軽に話してほしいと言われ、考えを率直に伝えました。'),
pair('{name}와 호칭에 얽매이지 않고 오늘의 사소한 일을 이야기했어요.|They talked with {name} about small things from the day without dwelling on titles.|{name}と敬称にこだわらず、今日のささいな出来事を話しました。','{name}와 격식보다 이야기 자체에 집중하며 대화를 나눴어요.|They focused on the conversation with {name} rather than ceremony.|{name}と形式より話の中身に集中して会話しました。')],
rivalry:[
pair('{name}와 정치적 생각이 달라 말이 잠시 멈췄지만, 상대의 설명을 들었어요.|A political difference paused the conversation with {name}, but they heard the explanation.|{name}と政治的な考えが違って言葉が止まりましたが、説明を聞きました。','{name}와 의견이 갈려도 목소리를 낮추고 자신의 이유를 설명했어요.|Despite disagreeing with {name}, they kept their voice low and explained why.|{name}と意見が分かれても声を抑え、自分の理由を説明しました。'),
pair('{name}와 논쟁을 더 키우지 않기로 하고, 당장 공감할 수 있는 화제로 옮겼어요.|They agreed with {name} not to escalate the debate and found some common ground.|{name}と議論を広げず、今は共感できる話題に移ることにしました。','{name}와 입장 차이를 남겨 둔 채, 함께 이야기할 수 있는 주제로 돌아왔어요.|Leaving their differences unresolved, they returned to a shared topic with {name}.|{name}との立場の違いは残したまま、共に話せる話題に戻りました。')],
audience:[
pair('{name}의 인사를 받고 어떤 이야기를 하러 왔는지 차분히 물었어요.|They acknowledged {name}’s greeting and calmly asked what they wished to discuss.|{name}の挨拶を受け、何を話したいのか静かに尋ねました。','군주인 {name}에게 인사를 올린 뒤 준비한 말을 천천히 꺼냈어요.|After greeting the sovereign {name}, they slowly began their prepared words.|君主である{name}に挨拶し、用意していた言葉をゆっくり口にしました。'),
pair('{name}가 말할 시간을 충분히 주고, 들은 내용을 다시 확인했어요.|They gave {name} time to speak and checked that they had understood.|{name}に十分な時間を取り、聞いた内容を確かめました。','군주인 {name}가 이야기를 확인해 주자, 빠뜨린 설명을 조심스럽게 덧붙였어요.|When the sovereign {name} checked the account, they carefully added a missing detail.|君主である{name}が話を確かめると、抜けていた説明を慎重に補いました。')],
practical:[
pair('{name}에게 평소 생활에서 불편한 점을 물으며 구체적인 이야기를 들었어요.|They asked {name} about everyday difficulties and listened to specific examples.|{name}に日常の不便を尋ね、具体的な話を聞きました。','{name}가 생활 이야기를 묻자, 작은 불편부터 차근차근 설명했어요.|Asked by {name} about daily life, they explained the small difficulties one by one.|{name}に暮らしを尋ねられ、小さな不便から順に説明しました。'),
pair('{name}의 경험에서 자신이 미처 몰랐던 생활의 차이를 들었어요.|{name}’s experience revealed a difference in daily life they had not considered.|{name}の経験から、気づいていなかった暮らしの違いを知りました。','{name}에게 자신의 하루를 설명하며 서로의 생활이 어떻게 다른지 이야기했어요.|They described their day to {name} and discussed how their lives differed.|{name}に自分の一日を説明し、暮らしの違いを話しました。')],
reassurance:[
pair('{name}가 말하기 어려워하자, 서두르지 않아도 된다고 전했어요.|Seeing {name} hesitate, they said there was no need to rush.|{name}が話しにくそうにすると、急がなくてよいと伝えました。','{name}가 기다려 주자, 조심스럽게 자신의 생각을 한마디 보탰어요.|As {name} waited, they cautiously added a thought of their own.|{name}が待ってくれたので、自分の考えを慎重に一言添えました。'),
pair('{name}와 서로 오해한 말이 없는지 확인하며 대화를 마무리했어요.|They closed the conversation with {name} by checking for misunderstandings.|{name}と誤解した言葉がないか確かめ、会話を終えました。','{name}와 뜻을 다시 확인하고, 처음보다 조금 편해진 마음으로 답했어요.|After checking meanings with {name}, they answered feeling a little more at ease.|{name}と意味を確かめ、初めより少し楽な気持ちで答えました。')]
};
