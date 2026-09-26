// Stable identifiers are persisted; translated labels never become save keys.
export const words=(ko,en,ja)=>({ko,en,ja});
export const label=(entry,lang='ko')=>entry?.label?.[lang]||entry?.label?.ko||'';
const rows=text=>text.trim().split('\n').map(row=>{const [id,ko,en,ja,recommendations='']=row.split('|');return {id,label:words(ko,en,ja),recommendations:recommendations.split(',').filter(Boolean)}});
export const SECRET_TYPES=rows(`custom|직접 입력|Write your own|自由入力
trauma|트라우마|Trauma|トラウマ
relationship|숨겨진 관계|Hidden relationship|隠された関係
preference|숨겨진 취향|Hidden preference|隠れた好み
identity|숨겨진 정체|Hidden identity|隠された正体
goal|숨겨진 목표|Secret goal|密かな目標`);
export const SECRET_TRIGGERS=rows(`dark|어두운 장소|Dark places|暗い場所
alone|혼자 남는 상황|Being left alone|一人になる場面
crowd|붐비는 장소|Crowds|人混み
confined|좁고 닫힌 공간|Confined spaces|狭い閉鎖空間
height|높은 곳|Heights|高い場所
water|깊은 물·물가|Deep water and watersides|深い水・水辺
fire|불·뜨거운 열기|Fire and intense heat|火・強い熱
storm|천둥·폭풍|Thunder and storms|雷・嵐
loud|갑작스러운 큰 소리|Sudden loud noises|突然の大きな音
conflict|다투는 상황|Arguments|言い争い
shouting|고함치는 목소리|Shouting|怒鳴り声
touch|예고 없는 신체 접촉|Unexpected physical contact|予告のない接触
separation|작별·헤어짐|Farewells|別れ
waiting|기약 없는 기다림|Waiting without an answer|先の見えない待ち時間
promise|중요한 약속|Important promises|大切な約束
secret|비밀을 이야기하는 상황|Discussing secrets|秘密を話す場面
attention|시선이 집중되는 상황|Being the center of attention|注目される場面
evaluation|시험·평가|Tests and evaluations|試験・評価
mistake|실수·실패|Mistakes and failure|失敗・間違い
authority|권위적인 상대|Authority figures|権威的な相手
hospital|병원·치료|Hospitals and treatment|病院・治療
illness|아픔·질병 이야기|Discussion of illness|病気の話
hunger|먹을 것이 부족한 상황|Food scarcity|食べ物が足りない状況
money|돈·빚 이야기|Money and debt|お金・借金の話
gift|선물을 받는 상황|Receiving gifts|贈り物を受け取る場面
animal|동물이 다가오는 상황|Approaching animals|動物が近づく場面
travel|이동·탈것|Travel and vehicles|移動・乗り物
home|집으로 돌아가는 상황|Returning home|帰宅する場面
family|가족 이야기|Discussion of family|家族の話
romance|사랑 고백·연애 이야기|Confessions and romance|告白・恋愛の話
competition|경쟁·승부|Competition|競争・勝負
accusation|의심·추궁|Suspicion and interrogation|疑い・追及
loss|잃어버린 것에 관한 이야기|Discussion of loss|失ったものの話
magic|마법·초자연 현상|Magic and supernatural events|魔法・超常現象
memory|과거를 묻는 상황|Questions about the past|過去を尋ねられる場面
silence|대화가 갑자기 끊기는 상황|Sudden silence|会話が突然途切れる場面`);
export const TRAUMA_EVENTS=rows(`abandonment|버려지거나 홀로 남겨진 일|Being abandoned|置き去りにされた経験|alone,separation,waiting
bereavement|소중한 사람과의 사별|Losing someone dear|大切な人との死別|loss,separation,family
betrayal|믿었던 사람의 배신|Betrayal by someone trusted|信頼した人の裏切り|promise,secret,accusation
bullying|따돌림|Being excluded and bullied|仲間外れにされた経験|crowd,attention,alone
humiliation|사람들 앞에서 망신당한 일|Public humiliation|人前で恥をかかされた経験|attention,evaluation,mistake
verbal|심한 꾸지람과 폭언|Harsh verbal attacks|激しい叱責や暴言|shouting,conflict,authority
violence|위협이나 폭력|Threats or violence|脅迫や暴力|touch,shouting,conflict
confinement|갇혀 나오지 못한 일|Being trapped|閉じ込められた経験|confined,dark,alone
lost|길을 잃고 헤맨 일|Getting lost|道に迷った経験|alone,dark,travel
fire|화재|A fire|火災|fire,loud,home
drowning|물에 빠진 일|Nearly drowning|溺れた経験|water,travel
fall|높은 곳에서 추락한 일|A fall from a height|高所からの転落|height,travel
accident|교통사고|A traffic accident|交通事故|travel,loud
disaster|큰 재해|A natural disaster|大きな災害|storm,loud,home
illness|오랜 투병|A long illness|長い闘病|hospital,illness,alone
treatment|두려웠던 치료|Frightening treatment|怖かった治療|hospital,touch,confined
poverty|심한 생활고|Severe hardship|深刻な生活苦|money,hunger,gift
starvation|굶주림|Going hungry|飢え|hunger,alone
debt|빚으로 인한 압박|Pressure from debt|借金による圧迫|money,authority,accusation
failure|중요한 시험이나 도전의 실패|Failure in an important challenge|大切な試験や挑戦の失敗|evaluation,mistake,competition
loss_work|소중한 작품이나 물건을 잃은 일|Losing treasured work or belongings|大切な作品や品物の喪失|loss,mistake,memory
breakup|괴로웠던 이별|A painful breakup|つらい別れ|romance,separation,promise
family_conflict|가족의 심한 다툼|Severe family conflict|家族の激しい争い|family,conflict,shouting
false_blame|억울한 누명|Being falsely accused|身に覚えのない疑い|accusation,authority,attention
exposure|비밀이 원치 않게 알려진 일|An unwanted disclosure|望まない秘密の暴露|secret,attention,promise
animal|동물에게 위협받은 일|Being threatened by an animal|動物に脅かされた経験|animal,touch
war|전쟁이나 전투|War or battle|戦争や戦闘|loud,conflict,fire
exile|고향에서 쫓겨난 일|Exile from home|故郷を追われた経験|home,separation,authority
curse|저주나 마법 사고|A curse or magical accident|呪いや魔法事故|magic,loss,memory
control|자유를 빼앗긴 일|Losing personal freedom|自由を奪われた経験|authority,confined,touch
neglect|도움을 청해도 외면당한 일|Being ignored when asking for help|助けを求めても無視された経験|silence,waiting,alone
broken_promise|중요한 약속이 깨진 일|A broken important promise|大切な約束が破られた経験|promise,waiting,separation`);
export const SECRET_ROLES=rows(`mastermind|흑막|Mastermind|黒幕
god|신|Deity|神
king|왕|Monarch|王
hero|영웅|Hero|英雄
villain|악당|Villain|悪役
demon|마왕|Demon ruler|魔王
spirit|정령|Spirit|精霊
witch|마녀·마법사|Witch or mage|魔女・魔法使い
royal|왕족|Royalty|王族
noble|귀족|Noble|貴族
rebel|반란군|Rebel|反乱軍
guardian|수호자|Guardian|守護者
traveler|이방인|Outsider|異邦人
immortal|불멸자|Immortal|不死者
heir|후계자|Heir|後継者
spy|첩자|Spy|密偵
monster|괴물|Monster|怪物
ordinary|평범한 사람|Ordinary person|普通の人`);
export const SECRET_RELATIONS=rows(`child|자녀|Child|子
parent|부모|Parent|親
grandchild|손자녀|Grandchild|孫
grandparent|조부모|Grandparent|祖父母
sibling|형제자매|Sibling|きょうだい
aunt|이모·삼촌·고모|Aunt or uncle|おじ・おば
niece|조카|Niece or nephew|おい・めい
cousin|사촌|Cousin|いとこ
enemy|원수|Sworn enemy|仇敵
benefactor|은인|Benefactor|恩人
protege|도움을 받은 사람|Person they helped|助けられた人
mentor|스승|Mentor|師匠
student|제자|Student|弟子
lover|연인|Lover|恋人
ex|옛 연인|Former lover|元恋人
spouse|배우자|Spouse|配偶者
ally|동맹|Ally|盟友
rival|경쟁자|Rival|好敵手
double|분신|Double|分身
creator|창조자|Creator|創造者
creation|피조물|Creation|被造物`);
export const SECRET_GOALS=rows(`reunite|잃어버린 사람을 찾고 싶다|Wants to find a lost person|失った人を探したい
forgive|누군가와 화해하고 싶다|Wants to reconcile|誰かと和解したい
escape|지금의 삶에서 벗어나고 싶다|Wants a different life|今の生活から抜け出したい
protect|소중한 사람을 지키고 싶다|Wants to protect someone|大切な人を守りたい
revenge|원수를 갚고 싶다|Wants revenge|復讐したい
create|자신만의 작품을 남기고 싶다|Wants to create a lasting work|自分の作品を残したい
recognition|진짜 자신을 인정받고 싶다|Wants their true self accepted|本当の自分を認めてほしい
home|돌아갈 곳을 찾고 싶다|Wants a place to belong|帰る場所を見つけたい
confess|숨겨 온 마음을 전하고 싶다|Wants to confess hidden feelings|秘めた思いを伝えたい
truth|감춰진 진실을 밝히고 싶다|Wants to uncover the truth|隠された真実を明かしたい`);
export const SECRET_TASTES=rows(`red|빨강|Red|赤
blue|파랑|Blue|青
green|초록|Green|緑
yellow|노랑|Yellow|黄色
purple|보라|Purple|紫
pink|분홍|Pink|ピンク
black|검정|Black|黒
white|하양|White|白
thriller|스릴러|Thrillers|スリラー
horror|공포|Horror|ホラー
romance|로맨스|Romance|恋愛
fantasy|판타지|Fantasy|ファンタジー
mystery|추리|Mysteries|ミステリー
sf|SF|Science fiction|SF
comedy|코미디|Comedy|コメディー
history|역사물|Historical stories|歴史もの
tragedy|비극|Tragedies|悲劇
poetry|시|Poetry|詩
classical|클래식|Classical music|クラシック
jazz|재즈|Jazz|ジャズ
rock|록|Rock music|ロック
rain|비 오는 날|Rainy days|雨の日
snow|눈 오는 날|Snowy days|雪の日
night|밤|Nighttime|夜
sunrise|해돋이|Sunrise|日の出
sea|바다|The sea|海
forest|숲|Forests|森
flowers|꽃|Flowers|花
stars|별|Stars|星
cats|고양이|Cats|猫
dogs|강아지|Dogs|犬
insects|곤충|Insects|昆虫
sweets|단 음식|Sweets|甘い食べ物
spicy|매운 음식|Spicy food|辛い食べ物
coffee|커피|Coffee|コーヒー
tea|차|Tea|お茶
cooking|요리|Cooking|料理
gardening|정원 가꾸기|Gardening|園芸
craft|수공예|Handicrafts|手芸
dance|춤|Dancing|踊り
singing|노래|Singing|歌
games|게임|Games|ゲーム
letters|손편지|Handwritten letters|手紙
antiques|골동품|Antiques|骨董品
plush|봉제 인형|Plush toys|ぬいぐるみ
solitude|혼자 보내는 시간|Time alone|一人の時間
parties|파티|Parties|パーティー
adventure|모험|Adventure|冒険`);
