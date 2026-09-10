import {OFFICIAL_RELATIONSHIP_DETAILS,normalizeRelationshipDetails,relationshipReality,detailText} from './official-relationship-details.js?v=20260909dev305';
import {routineMemory} from './relationship-routines.js?v=20260909dev305';
const tri=(ko,en,ja)=>({ko,en,ja});
// These details only enter the story after the user selects the corresponding fact.
const memories={
 '가족':[
 tri('같은 피를 나눴다는 말 뒤에 저마다 다른 삶이 이어져 왔다는 생각을 했어요.','They thought of the separate lives behind the words shared blood.','同じ血を引くという言葉の向こうに、それぞれの人生があると思いました。'),
 tri('같은 가문의 이름을 말할 때마다 함께 따라오는 기대와 책임을 떠올렸어요.','They recalled the expectations and responsibilities that came with naming their clan.','一族の名を口にするたびについてくる期待と責任を思い出しました。'),
 tri('각자의 사정이 한 지붕 아래로 모였던 때를 떠올리며, 함께 살기 전과 달라진 일상을 짚었어요.','They recalled the circumstances that brought them under one roof and considered how daily life had changed.','それぞれの事情で一つ屋根の下に集まった頃を思い、変わった日々を振り返りました。'),
 tri('가족으로 지내기 위해 약속했던 조건을 떠올리며, 지금도 지켜지고 있는 부분을 하나씩 짚었어요.','They recalled the terms of living as a family and considered which still held.','家族として過ごすために約束した条件を思い出し、今も守られている点を確かめました。')],
 '조부모·손자녀':[
 tri('어릴 적 함께 살던 집의 문을 열면 누가 먼저 돌아와 있었는지 떠올렸어요.','They pictured who used to be home first when the door opened in childhood.','幼い頃、家の扉を開けると誰が先に帰っていたか思い浮かべました。'),
 tri('방학이 시작되면 방문할 날을 세던 달력이 떠올랐어요.','They remembered counting down the days to a school-holiday visit.','休みに入ると、訪ねる日まで数えていたカレンダーを思い出しました。'),
 tri('이미 자란 뒤 처음 마주했을 때, 어디서부터 이야기를 꺼낼지 망설이던 순간이 떠올랐어요.','They recalled meeting after growing up and hesitating over where to begin.','成長して初めて向き合い、何から話そうか迷った瞬間を思い出しました。')],
 '친척':[
 tri('가족 모임에서 서로의 이름을 확인하던 목소리가 떠올랐어요.','They recalled checking each other’s names at a family gathering.','親族の集まりで互いの名前を確かめた声を思い出しました。'),
 tri('가족이 소개하자 처음으로 서로를 향해 고개를 돌렸던 순간을 떠올렸어요.','They recalled turning toward one another as a family member introduced them.','家族に紹介され、初めて互いへ顔を向けた瞬間を思い出しました。'),
 tri('오랜만에 만난 얼굴에서 기억에 남은 모습을 찾아보던 날이 떠올랐어요.','They recalled searching a long-unseen face for the person they remembered.','久しぶりの顔に記憶の面影を探した日を思い出しました。')],
 '그 외 가족':[
 tri('어릴 때부터 가족이라고 부르던 이름을 속으로 다시 불러 보았어요.','They silently repeated a name they had called family since childhood.','幼い頃から家族として呼んだ名前を、心の中でもう一度呼びました。'),
 tri('처음 가족으로 소개되던 날, 익숙한 이름들 사이에 새 이름이 놓이던 순간이 떠올랐어요.','They recalled a new name joining the familiar ones on the day the family grew.','家族として紹介された日、馴染みの名前に新しい名前が加わった瞬間を思い出しました。'),
 tri('뒤늦게 가족이라는 사실을 알았을 때, 지난 대화를 다시 떠올려 보던 순간을 기억했어요.','They recalled revisiting old conversations after discovering the family connection.','後から家族だと知り、以前の会話を思い返した瞬間を覚えていました。')],
 '보호자·피보호자':[
 tri('가족에게 부탁을 받던 날, 앞으로 필요한 일을 하나씩 짚던 대화가 떠올랐어요.','They recalled listing what would be needed when family first asked for support.','家族から頼まれ、これから必要なことを一つずつ確認した会話を思い出しました。'),
 tri('도움이 필요한 일을 처음 말로 꺼내고 서로의 답을 기다리던 순간이 떠올랐어요.','They recalled first putting a need for help into words and waiting for an answer.','助けが必要なことを初めて言葉にし、返事を待った瞬間を思い出しました。'),
 tri('어디까지 도울지 함께 약속하던 날의 말을 차례로 되짚었어요.','They retraced the words of their agreement about the support they would share.','どこまで助けるか約束した日の言葉を順にたどりました。')],
 '같은 가문':[
 tri('본가에서 함께 자라며 수도 없이 오갔던 길목을 떠올렸어요.','They pictured the passageways they had crossed so often growing up in the main household.','本家で育ちながら何度も行き来した通り道を思い浮かべました。'),
 tri('서로 다른 집안의 소식을 들고 만나던 자리에서 처음 이름을 익혔던 때가 떠올랐어요.','They recalled learning each other’s names while exchanging news between family branches.','分家同士の知らせを交わす席で、初めて名前を覚えた時を思い出しました。'),
 tri('가문 행사에서 누구와 연결된 사람인지 소개받던 순간이 떠올랐어요.','They recalled being introduced through family connections at a clan gathering.','一族の行事で、誰につながる人なのか紹介された瞬間を思い出しました。')],
 '선택한 가족':[
 tri('힘든 시기를 함께 지나며 그날 할 수 있는 일부터 나누던 대화가 떠올랐어요.','They remembered dividing up what could be done that day during a difficult time.','苦しい時期、今日できることから分け合った会話を思い出しました。'),
 tri('오래 함께 살던 사이에 가족이라는 이름을 붙이기로 했던 날이 떠올랐어요.','They remembered the day they chose to call their long-shared life a family.','長く共に暮らした関係を家族と呼ぶことにした日を思い出しました。'),
 tri('서로 가족이 되자고 약속하던 순간, 말을 끝내고 답을 기다리던 틈이 떠올랐어요.','They remembered the pause for an answer when they agreed to become family.','家族になろうと約束した時、言葉を終えて返事を待った間を思い出しました。')],
 '친구':[
 tri('같은 취미 이야기에 대화가 예상보다 길어졌던 처음을 떠올렸어요.','They recalled a first conversation about their shared hobby lasting longer than expected.','共通の趣味で、初めての会話が思いのほか長くなったことを思い出しました。'),
 tri('우연히 꺼낸 한마디에서 시작된 대화가 어디로 흘렀는지 되짚었어요.','They retraced where a conversation sparked by a chance remark had gone.','偶然の一言から始まった会話がどこへ続いたか、たどりました。'),
 tri('지인이 서로를 소개한 뒤 처음 어떤 말을 건넸는지 떠올렸어요.','They recalled their first words after a mutual acquaintance introduced them.','知人に紹介されてから最初に交わした言葉を思い出しました。')],
 '연인':[
 tri('친구라고 부르던 사이에서 연인이 된 뒤, 처음 서로를 소개하던 순간이 떠올랐어요.','They recalled first introducing each other as partners after being friends.','友人から恋人になり、初めて互いを紹介した瞬間を思い出しました。'),
 tri('소개로 마주 앉았던 날에는 몰랐던 서로의 일상이 하나씩 떠올랐어요.','They pictured the everyday details they had not known at their first introduction.','紹介されて向き合った日には知らなかった、互いの日常が浮かびました。'),
 tri('고백의 말을 끝내고 대답이 오기까지의 짧은 틈을 떠올렸어요.','They remembered the brief pause between the confession and the answer.','告白の言葉が終わり、返事が届くまでの短い間を思い出しました。')],
 '약혼':[
 tri('청혼에 답을 건네고, 그 말이 두 사람의 다음 약속이 되던 순간을 떠올렸어요.','They recalled answering the proposal as the words became a promise for their future.','求婚に答え、その言葉が二人の次の約束になった瞬間を思い出しました。'),
 tri('언젠가의 이야기를 구체적인 미래로 바꾸어 말하던 날을 떠올렸어요.','They recalled the day an imagined someday became a concrete future in conversation.','いつかの話を具体的な将来として語った日を思い出しました。'),
 tri('정해진 약혼 이야기를 마주하고, 앞으로 무엇을 결정해야 할지 짚던 순간이 떠올랐어요.','They recalled facing the arranged engagement and reviewing what still needed deciding.','決められた婚約を前に、これから何を決めるか確認した瞬間を思い出しました。')],
 '부부':[
 tri('연인으로 만나던 때와 부부가 된 뒤의 하루를 나란히 떠올렸어요.','They set a day from their dating years beside a day of married life in their mind.','恋人だった頃の一日と、夫婦になってからの一日を並べて思い浮かべました。'),
 tri('정략결혼을 앞두고 서로의 조건을 확인하던 날, 대화 사이의 침묵이 떠올랐어요.','They recalled the silences between discussing terms before their arranged marriage.','政略結婚を前に条件を確かめた日、会話の合間の沈黙を思い出しました。'),
 tri('계약서의 마지막 줄을 확인하고 이름을 적던 순간을 떠올렸어요.','They recalled checking the final line of the contract and writing their name.','契約書の最後の行を確かめ、名前を書いた瞬間を思い出しました。')],
 '부모·자녀':[
 tri('어릴 때 같은 집에서 오가던 인사와 지금의 인사를 겹쳐 떠올렸어요.','They set childhood greetings in the shared home beside the greetings of today.','幼い頃、同じ家で交わした挨拶と今の挨拶を重ねました。'),
 tri('성장하던 중 새 가족으로 서로를 알아가던 때의 호칭이 떠올랐어요.','They recalled what they called each other while getting to know a new family during childhood.','成長の途中、新しい家族として知り合っていった頃の呼び方を思い出しました。'),
 tri('성인이 되어 다시 만난 날, 그동안의 시간을 어디서부터 설명할지 망설였던 순간이 떠올랐어요.','They recalled their adult reunion and wondering where to begin with the years between.','成人して再会した日、空白の年月をどこから話すか迷った瞬間を思い出しました。')],
 '형제·자매':[
 tri('같은 집에서 자라며 서로의 차례를 기다리던 일상을 떠올렸어요.','They recalled waiting for each other’s turn while growing up in one home.','同じ家で育ち、互いの順番を待った日々を思い出しました。'),
 tri('따로 자란 시간을 짧은 대화로 메울 수 없었던 첫 만남이 떠올랐어요.','They recalled a first meeting where a short conversation could not cover years of growing up apart.','別々に育った年月を短い会話では埋められなかった、初めての対面を思い出しました。'),
 tri('같은 방을 쓰던 때, 각자의 자리를 나누어 두었던 모습을 떠올렸어요.','They recalled marking out their own corners when they shared a room.','同じ部屋を使い、それぞれの場所を分けていた様子を思い出しました。')],
 '동거인':[
 tri('처음 생활비를 나누어 계산하던 날의 항목들을 떠올렸어요.','They recalled the items they added up when first splitting living costs.','初めて生活費を分けて計算した日の項目を思い出しました。'),
 tri('지인의 소개를 받고 함께 살 공간을 처음 확인하던 순간이 떠올랐어요.','They recalled inspecting their future shared space after an introduction.','紹介を受け、一緒に暮らす場所を初めて確かめた瞬間を思い出しました。'),
 tri('잠시 머물기로 한 첫날, 어느 공간을 써도 되는지 묻던 대화가 떠올랐어요.','They recalled asking which spaces were available on the first day of a temporary stay.','一時的に泊まる初日、どこを使ってよいか尋ねた会話を思い出しました。')],
 '소꿉친구':[
 tri('어릴 적 같은 동네에서 서로를 만나던 길목을 마음속으로 따라 걸었어요.','They mentally followed the neighborhood path where they met as children.','幼い頃に出会った近所の道を、心の中でたどりました。'),
 tri('같은 학교에서 처음 이름을 부르던 때의 목소리를 떠올렸어요.','They recalled the sound of first calling each other’s names at school.','同じ学校で初めて名前を呼んだ声を思い出しました。'),
 tri('가족들이 이야기를 나누는 사이 서로를 처음 알아보던 때가 떠올랐어요.','They recalled first getting acquainted while their families talked.','家族が話す間に、初めて互いを知っていった時を思い出しました。')],
 '학창 시절 친구들':[
 tri('같은 반에서 서로의 이름을 아직 외우지 못했던 첫 무렵이 떠올랐어요.','They recalled the early days in class before they knew each other’s names.','同じクラスで、まだ互いの名前も覚えていなかった頃を思い出しました。'),
 tri('동아리 활동을 마치고 다음에 할 일을 정하던 대화가 떠올랐어요.','They recalled deciding what to do next after a school club session.','部活が終わり、次にすることを決めた会話を思い出しました。'),
 tri('조별 과제에서 누구부터 맡을지 정하던 첫 대화를 떠올렸어요.','They remembered first dividing up the group assignment.','グループ課題で誰から担当するか決めた最初の会話を思い出しました。')],
 '친구 모임':[
 tri('친구가 다른 친구를 소개할 때마다 모임에 이름이 하나씩 늘던 때를 떠올렸어요.','They remembered another name joining the group with each introduction.','友人が友人を紹介するたび、集まりに名前が増えた頃を思い出しました。'),
 tri('같은 관심사로 모인 첫날, 서로 어떤 부분을 좋아하는지 묻던 이야기가 떠올랐어요.','They recalled asking what each person liked at their first gathering around a shared interest.','共通の関心で集まった初日、それぞれ何が好きか尋ねた話を思い出しました。'),
 tri('오랜만에 다시 모여 달라진 근황부터 나누던 날이 떠올랐어요.','They recalled starting their reunion with everything that had changed.','久しぶりに集まり、変わった近況から話した日を思い出しました。')],
 '산악회':[
 tri('초보 산행에 처음 참여해 출발 전에 준비물을 확인하던 순간이 떠올랐어요.','They recalled checking supplies before setting off on their first beginners hike.','初めて初心者の登山に参加し、出発前に持ち物を確かめた瞬間を思い出しました。'),
 tri('산행에 함께 가 보자는 권유를 받고 어떤 길인지 묻던 대화가 떠올랐어요.','They recalled asking about the route after being invited on a hike.','登山に誘われ、どんな道か尋ねた会話を思い出しました。'),
 tri('정기 산행의 출발 자리에서 처음 서로의 이름을 익혔던 때가 떠올랐어요.','They recalled learning each other’s names at the start of a regular hike.','定例登山の出発場所で、初めて名前を覚えた時を思い出しました。')],
 '동아리 동료':[
 tri('같은 날 가입해 아직 낯설던 활동 순서를 함께 확인하던 때가 떠올랐어요.','They recalled figuring out unfamiliar routines after joining on the same day.','同じ日に入り、まだ不慣れな活動の手順を一緒に確かめた時を思い出しました。'),
 tri('선배와 신입으로 만나 활동 방법을 처음 주고받던 대화가 떠올랐어요.','They recalled the first exchange of instructions between senior and newcomer.','先輩と新入りとして、活動のやり方を初めて伝え合った会話を思い出しました。'),
 tri('행사 준비가 끝나지 않아 다음에 할 일을 나누어 적던 순간이 떠올랐어요.','They recalled dividing up unfinished event preparations.','行事の準備が終わらず、次の仕事を分けて書いた瞬間を思い出しました。')],
 '직장 동료':[
 tri('비슷한 시기에 입사해 아직 익숙하지 않은 업무 용어를 확인하던 때가 떠올랐어요.','They recalled checking unfamiliar work terms after joining around the same time.','同じ頃に入社し、不慣れな仕事の用語を確かめた時を思い出しました。'),
 tri('처음 같은 프로젝트를 맡아 각자의 담당을 나누던 순간이 떠올랐어요.','They recalled dividing responsibilities on their first shared project.','初めて同じ案件を担当し、役割を分けた瞬間を思い出しました。'),
 tri('부서가 바뀐 뒤 처음 업무를 연결하며 설명을 주고받던 날이 떠올랐어요.','They recalled exchanging explanations when coordinating work after a transfer.','異動後、初めて仕事をつなぎながら説明を交わした日を思い出しました。')],
 '사제 관계':[
 tri('가르침을 청하고 무엇부터 배울지 묻던 첫 대화를 떠올렸어요.','They recalled the first conversation about what to learn after requesting instruction.','教えを請い、何から学ぶか尋ねた最初の会話を思い出しました。'),
 tri('우연히 받은 조언 하나가 다음 질문으로 이어지던 순간이 떠올랐어요.','They recalled a chance piece of advice leading to another question.','偶然もらった助言が次の質問につながった瞬間を思い出しました。'),
 tri('가르치고 배울 사람으로 소개받아 앞으로의 순서를 정하던 날이 떠올랐어요.','They recalled planning the first steps after being assigned as teacher and learner.','教える人と学ぶ人として紹介され、これからの順序を決めた日を思い出しました。')],
 '라이벌':[
 tri('같은 목표를 향한다는 걸 처음 알고 서로의 진척을 확인하던 때가 떠올랐어요.','They recalled first discovering their shared goal and comparing progress.','同じ目標だと知り、互いの進み具合を確かめた時を思い出しました。'),
 tri('대회에서 처음 맞붙기 직전, 상대의 이름을 확인하던 순간이 떠올랐어요.','They recalled checking their opponent’s name before their first competition together.','大会で初めて対戦する直前、相手の名前を確かめた瞬間を思い出しました。'),
 tri('주변에서 둘을 나란히 비교하기 시작했던 말을 떠올렸어요.','They recalled the remarks that first put them side by side in comparison.','周囲が二人を並べて比較し始めた言葉を思い出しました。')],
 '혐관':[
 tri('같은 일에서 서로 원하는 결과가 다르다는 걸 알게 된 순간을 떠올렸어요.','They recalled realizing they wanted different outcomes from the same situation.','同じことから望む結果が違うと知った瞬間を思い出しました。'),
 tri('같은 말을 서로 다르게 받아들였던 대화를 처음부터 되짚었어요.','They retraced a conversation whose words they had understood differently.','同じ言葉を違う意味で受け取った会話を、最初からたどりました。'),
 tri('약속이 지켜지지 않았음을 알게 된 날, 어디까지 기다렸는지 떠올렸어요.','They recalled how long they waited on the day the promise went unkept.','約束が守られなかった日、どこまで待ったか思い出しました。')],
 '기타':[
 tri('같은 목적을 위해 처음 할 일을 나누던 대화가 떠올랐어요.','They recalled first dividing tasks toward a shared purpose.','共通の目的に向け、初めて仕事を分けた会話を思い出しました。'),
 tri('우연히 같은 일에 얽혀 서로의 사정을 확인하던 순간이 떠올랐어요.','They recalled checking each other’s situation after a chance event brought them together.','偶然同じ出来事に関わり、互いの事情を確かめた瞬間を思い出しました。'),
 tri('둘 사이에 무엇을 약속할지 하나씩 정하던 때를 떠올렸어요.','They recalled deciding, one by one, what promises to make between them.','二人の間で何を約束するか、一つずつ決めた時を思い出しました。')]
};
const first={
 spring:tri('처음 마주했던 벚꽃 아래, 말 사이로 꽃잎이 떨어지던 모습을 떠올렸어요.','They pictured petals falling between their words beneath the cherry blossoms where they first met.','初めて向き合った桜の下、言葉の合間に花びらが落ちた様子を思い出しました。'),
 rain:tri('같은 처마 아래서 비가 그치기를 기다리던 날, 빗소리 사이로 주고받던 말을 떠올렸어요.','They recalled words exchanged through the rain while waiting under the same eaves.','同じ軒下で雨がやむのを待ち、雨音の間に交わした言葉を思い出しました。'),
 document:tri('계약서에 나란히 이름을 남기던 날, 서명을 마친 자리에 시선이 머물던 순간을 떠올렸어요.','They recalled their gaze resting on the signatures after signing the contract together.','契約書に並んで名前を残した日、署名の上に視線がとどまった瞬間を思い出しました。'),
 introduced:tri('소개받아 마주 앉았던 날, 처음 이름을 부르기 전의 짧은 망설임을 떠올렸어요.','They recalled the brief hesitation before first saying a name across the introduction table.','紹介されて向かい合った日、初めて名前を呼ぶ前の短いためらいを思い出しました。'),
 help:tri('떨어뜨린 물건을 함께 주워 모으던 날, 마지막으로 남은 것을 확인하던 순간을 떠올렸어요.','They recalled checking for the last item while gathering dropped belongings together.','落とした物を共に拾い、最後に残った物を確かめた瞬間を思い出しました。')
};
const endings={
 warm:[tri('그때는 몰랐던 상대의 작은 습관까지 이제는 익숙해졌다는 생각에 잠시 머물렀어요.','They lingered on how even the small habits they had not known then were familiar now.','あの頃は知らなかった小さな癖まで今は馴染んでいると、しばらく思いました。'),tri('지금도 이어지는 사이를 생각하며, 다음에 그 이야기를 꺼낼 말을 골라 보았어요.','Thinking of their continuing bond, they considered how to bring it up next time.','今も続く関係を思い、次にその話をどう切り出そうか考えました。'),tri('달라진 일상 속에서도 그대로인 부분을 찾아, 마음속에 조금 더 남겨 두었어요.','They found what had stayed the same through changing days and held it a little longer.','変わった日々の中にも変わらない部分を見つけ、心にもう少しとどめました。')],
 strained:[tri('지금의 불편한 사이를 겹쳐 보다가, 그때 쉽게 넘겼던 말을 다시 생각했어요.','Against their strained relationship now, they reconsidered words once passed over.','今の気まずい関係と重ね、当時聞き流した言葉を考え直しました。'),tri('예전처럼 받아들이기 어려워진 부분에서 생각이 멈췄어요.','Their thoughts stopped at what they could no longer accept as before.','以前のようには受け止められなくなったところで、考えが止まりました。'),tri('관계를 되돌아보다가 오늘은 어디까지 거리를 둘지 생각을 정리했어요.','Looking back, they considered how much distance to keep today.','関係を振り返り、今日はどこまで距離を置くか考えを整理しました。')],
 neutral:[tri('그날 알았던 것과 나중에 알게 된 것을 나누어 떠올린 뒤 하던 일로 돌아갔어요.','They separated what they knew then from what they learned later, then returned to their task.','その日に知っていたことと後から知ったことを分けて思い出し、作業に戻りました。'),tri('기억 속 대화를 끝까지 되짚고, 지금의 생각과 다른 부분을 조용히 남겨 두었어요.','They followed the remembered conversation through and left its differences from today unresolved.','記憶の会話を最後までたどり、今の考えと違う部分は静かに残しました。'),tri('그때와 지금 사이에 지나간 시간을 헤아리다 시선을 다시 앞으로 돌렸어요.','They counted the time between then and now before looking ahead again.','あの時から今までの時間を数え、再び前に視線を戻しました。')],
 past:[tri('지금은 끝난 관계라는 사실을 떠올리고, 그 기억에 다음 약속을 덧붙이지 않았어요.','Remembering that the relationship had ended, they did not turn the memory into another promise.','今は終わった関係だと思い出し、その記憶に次の約束を重ねませんでした。'),tri('그때의 호칭이 잠시 떠올랐지만, 지금도 같은 사이라고 여기지는 않았어요.','An old way of addressing them surfaced, without making the relationship current again.','昔の呼び方が一瞬浮かびましたが、今も同じ関係だとは考えませんでした。'),tri('예전 일을 현재의 답으로 삼지 않고, 기억을 그날의 자리에 남겨 두었어요.','They left the memory in its own time rather than using it as an answer for today.','昔の出来事を今の答えにせず、記憶をその日の場所に残しました。')]
};
const hash=s=>[...String(s)].reduce((h,c)=>(Math.imul(h,31)+c.charCodeAt(0))>>>0,0);
export function relationshipMemory(actor,other,relation,view={},options={}){
 const details=normalizeRelationshipDetails(relation?.type,relation?.details),reality=relationshipReality(relation,view),language=options.language||'ko';
 const choices=[];if(details.origin!==undefined)choices.push({id:'origin',copy:memories[relation.type]?.[Number(details.origin)]});if(details.firstMeeting)choices.push({id:'firstMeeting',copy:first[details.firstMeeting]});if(details.routine!==undefined)choices.push({id:'routine',copy:routineMemory(relation.type,details.routine)});
 if(!choices.length)return null;
 const n=hash(`${options.seed||''}:${actor.id}:${relation.id||relation.type}`),choice=choices[n%choices.length],variant=Math.floor(n/choices.length)%3;
 let ending=(endings[reality.tone]||endings.neutral)[variant];
 if(reality.tone==='practical')ending=tri('상대와의 감정을 붙잡기보다 지금 남은 일과 각자 맡을 부분을 구분한 뒤 생각을 접었어요.','They separated the remaining tasks and responsibilities, then put the thought aside.','相手への感情を引き止めるより、残った用事と分担を分けて考えを切り上げました。');
 if(reality.tone==='uneasy')ending=[
 tri('지금은 마음에 걸리는 부분이 있어도, 당시의 사정까지 없던 일로 할 수는 없다고 생각했어요.','Though parts troubled them now, they could not dismiss the circumstances they had faced then.','今は気にかかることがあっても、当時の事情までなかったことにはできないと思いました。'),
 tri('아쉬운 선택을 되짚다가도, 그때 할 수 있었던 일이 무엇인지 함께 헤아렸어요.','While reconsidering a choice, they also weighed what had actually been possible then.','惜しい選択を振り返りながらも、当時できたことは何だったか考えました。'),
 tri('지금의 어긋남이 전부 그날의 탓인지는 단정하지 못한 채, 바꿀 수 있는 부분부터 생각했어요.','They could not blame all of today’s difficulties on that day and considered what could still change.','今のすれ違いが全てあの日のせいとは決めつけず、変えられる部分から考えました。')
 ][variant];
 // Regret requires both a deteriorated official stage and this actor's negative view.
 if(relation.type==='부부'&&['1','2'].includes(details.origin)&&reality.tone==='strained')ending=[
 tri('불편해진 사이를 생각하자, 그때 받아들인 조건을 지금도 선택할 수 있을지 선뜻 답하지 못했어요.','Thinking of their strained marriage, they could not readily say they would accept those terms again.','険悪になった仲を思うと、あの条件を今も選ぶか、すぐには答えられませんでした。'),
 tri('지금의 불편한 마음과 그날의 결정을 나란히 놓고 후회가 남는 지점을 되짚었어요.','They set their current reservations beside that decision and examined where regret remained.','今の居心地の悪さとあの日の決断を並べ、後悔が残るところをたどりました。'),
 tri('결혼을 정하던 때와 달라진 사이를 생각하며, 그 선택을 되돌릴 수 있었다면 어땠을지 한동안 머물렀어요.','They lingered over how the marriage had changed and what it would mean to undo that choice.','結婚を決めた頃と変わった仲を思い、選び直せたならとしばらく考えました。')
 ][variant];
 return {title:detailText(tri(`${other.name}와의 지난 일을 떠올리는 중`,`Remembering their history with ${other.name}`,`${other.name}との過去を思い返すところ`),language),text:[detailText(choice.copy,language),detailText(ending,language)].join(' '),key:`memory:${relation.type}:${choice.id}:${variant}:${reality.tone}`,reality,fields:['type','stage','temporalStatus','details',...Object.keys(view)],solo:true};
}
export const relationshipMemoryCoverage=()=>({types:Object.keys(memories),origins:Object.values(memories).reduce((sum,rows)=>sum+rows.length,0)});
