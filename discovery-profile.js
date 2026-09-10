import {FORM_FIELDS} from './discovery-records.js?v=20260909dev305';
const tri=(ko,en,ja)=>({ko,en,ja});
const opt=(value,en,ja)=>({value,text:tri(value,en,ja)});
const age=[opt('어린이','Child','子ども'),opt('청소년','Teen','青少年'),opt('청년','Young adult','青年'),opt('성인','Adult','成人'),opt('중년','Middle-aged','中年'),opt('장년','Mature adult','壮年'),opt('노년','Older adult','老年'),opt('나이 불명','Unknown age','年齢不明')];
const gender=[opt('남성','Male','男性'),opt('여성','Female','女性'),opt('그외','Other','その他'),opt('설정하지 않음','Unspecified','未設定')];
const pick=(id,field,icon,animation,question,options,requires)=>({id,field,icon,animation,question:tri(...question),options,requires,choices:[{text:tri('이렇게 기억해 두기','Remember it this way','こう覚えておく'),effects:{}}]});
export const PROFILE_EVENTS=[
pick('profile-age-peer','ageGroup','👋','wave',['길에서 동년배를 만났어요. 둘은 [선택]이에요.','They meet a peer on the street. Both are [select].','道で同世代に会いました。二人とも[選択]です。'],age),
pick('profile-age-cake','ageGroup','🎂','bounce',['케이크 위 초를 세다가 포기했어요. 지금 나이대는 [선택]이에요.','They give up counting the candles. Their age group is [select].','ケーキのろうそくを数えて断念。今の年齢層は[選択]です。'],age),
pick('profile-gender-card','gender','🪪','ponder',['소개 카드가 이름 다음 칸에서 멈췄어요. 내 성별은 [선택]이라고 적어요.','The introduction card pauses after their name. Their gender is [select].','紹介カードが名前の次で止まりました。性別は[選択]と書きます。'],gender),
pick('profile-gender-intro','gender','🎤','wave',['마이크를 넘겨받았어요. 자기소개에서 성별은 [선택]으로 소개해요.','The microphone is passed to them. They introduce their gender as [select].','マイクが回ってきました。自己紹介では性別を[選択]と伝えます。'],gender),
pick('profile-height','bodyProfile.heightCm','📏','stretch',['줄자가 괜히 긴장한 것 같아요. 내 키는 [선택]cm예요.','The measuring tape looks nervous. Their height is [select] cm.','メジャーが緊張しているようです。身長は[選択]cmです。'],Array.from({length:281},(_,i)=>({value:String(i+20),text:tri(String(i+20),String(i+20),String(i+20))}))),
pick('profile-weight','bodyProfile.weightKg','⚖️','surprise',['체중계가 숫자를 내밀었어요. 내 몸무게는 [선택]kg예요.','The scale presents its verdict. Their weight is [select] kg.','体重計が数字を差し出しました。体重は[選択]kgです。'],Array.from({length:300},(_,i)=>({value:String(i+1),text:tri(String(i+1),String(i+1),String(i+1))}))),
pick('profile-hair-length','bodyProfile.appearance.hairLength','✂️','sway',['미용사가 얼마나 남길지 물어요. 평소 머리 길이는 [선택]이에요.','The stylist asks how much to leave. Their usual hair is [select].','美容師がどれくらい残すか聞きます。普段の髪は[選択]です。'],[opt('숏컷','Short','短髪'),opt('단발','Bob length','ボブ'),opt('어깨 길이','Shoulder length','肩まで'),opt('가슴 길이','Long','長髪')]),
pick('profile-hair-texture','bodyProfile.appearance.hairTexture','🪮','sway',['빗과 머리카락 사이에 협상이 필요해요. 머릿결은 [선택]이에요.','The comb negotiates with their hair. Its texture is [select].','櫛と髪に交渉が必要です。髪質は[選択]です。'],[opt('완전한 직모','Straight','直毛'),opt('약한 반곱슬','Slightly wavy','ややくせ毛'),opt('굵은 곱슬','Curly','くせ毛')]),
pick('profile-hair-color','bodyProfile.appearance.hairColor','🎨','ponder',['초상화 화가가 붓을 멈췄어요. 지금 머리색은 [선택]이에요.','The portrait artist pauses. Their current hair color is [select].','肖像画家が筆を止めました。今の髪色は[選択]です。'],[opt('검은색','Black','黒'),opt('갈색','Brown','茶'),opt('금발','Blond','金'),opt('백발·은발','White or silver','白・銀'),opt('빨간색','Red','赤')]),
pick('profile-hair-origin','bodyProfile.appearance.hairColorOrigin','🧴','ponder',['누군가 머리색의 비결을 물었어요. 사실 [선택]이에요.','Someone asks their hair-color secret. It is [select].','髪色の秘密を聞かれました。実は[選択]です。'],[opt('자연모','Natural','地毛'),opt('전체 염색','Dyed','染髪')],{known:'bodyProfile.appearance.hairColor'}),
{id:'profile-tattoo-encounter',icon:'✒️',animation:'blush',question:tri('길에서 타투한 사람을 만났어요. 문양이 잠깐 눈에 들어왔어요.','They pass someone with a tattoo. The design catches their eye.','道でタトゥーのある人に会い、模様がふと目に入りました。'),choices:[
{text:tri('내 몸의 타투처럼 정말 멋지다고 생각한다','Think it looks wonderful, like their own tattoo','自分のタトゥーのように素敵だと思う'),effects:{},tattoo:'아끼며 드러내고 싶어함'},
{text:tri('결국 나처럼 후회할 것이라고 생각한다','Think they will regret it too, just as they do','結局、自分のように後悔するだろうと思う'),effects:{},tattoo:'없애고 싶어함'},
{text:tri('내 타입은 아니라고 생각하고 지나간다','Decide it is not their type and move on','自分の好みではないと思い通り過ぎる'),effects:{interference:-1}},
{text:tri('아무 생각 없이 지나간다','Walk on without a thought','何も考えず通り過ぎる'),effects:{emotionalSensitivity:-1}},
{text:tri('수줍게 볼을 붉힌다','Blush shyly','恥ずかしそうに頬を染める'),effects:{emotionalExpression:1}}]},
pick('profile-tattoo-location','bodyProfile.tattoos','✒️','ponder',['거울 앞에서 내 타투가 눈에 들어왔어요. [선택]에 있어요.','Their tattoo catches their eye in the mirror. It is on their [select].','鏡の前で自分のタトゥーに目が留まりました。[選択]にあります。'],[opt('왼팔','Left arm','左腕'),opt('오른팔','Right arm','右腕'),opt('왼손','Left hand','左手'),opt('오른손','Right hand','右手'),opt('왼쪽 어깨','Left shoulder','左肩'),opt('오른쪽 어깨','Right shoulder','右肩'),opt('등 전체','Full back','背中全体'),opt('배·옆구리','Abdomen or side','腹・脇腹'),opt('왼쪽 허벅지','Left thigh','左太もも'),opt('오른쪽 종아리','Right calf','右ふくらはぎ')],{tattoo:true}),
pick('profile-tattoo-design','bodyProfile.tattoos','🖋️','ponder',['타투에 담긴 무늬를 천천히 살펴봐요. [선택]이에요.','They study the design of their tattoo. It is [select].','タトゥーの模様をゆっくり眺めます。[選択]です。'],[opt('문자·문구','Lettering','文字'),opt('기하학 무늬','Geometric','幾何学模様'),opt('꽃·식물','Flowers or plants','花・植物'),opt('동물','Animal','動物'),opt('상징·문장','Symbol or crest','象徴・紋章'),opt('추상 무늬','Abstract','抽象模様')],{answered:'profile-tattoo-location'}),
];

// Replace one-field follow-ups with one atomic, repeatable-row editor.
PROFILE_EVENTS.splice(PROFILE_EVENTS.findIndex(q=>q.id==='profile-tattoo-location'),2);
const form=(id,kind,icon,question,requires)=>({id,form:kind,fields:FORM_FIELDS[kind],icon,animation:'ponder',question:tri(...question),requires,choices:[{text:tri('설정 저장하기','Save settings','設定を保存'),effects:{}}]});
PROFILE_EVENTS.push(
 form('profile-tattoo-details','tattoos','✒️',['거울 앞에서 내 타투를 살펴봐요. 어디에 어떤 문양이 있고, 나는 어떻게 생각하나요?','They look at their tattoos in the mirror. Where are they, what do they depict, and how do they feel about them?','鏡の前で自分のタトゥーを眺めます。どこにどんな模様があり、どう思っていますか？'],{tattoo:true}),
 form('profile-medications','medications','💊',['챙겨 두는 약을 정리하고 있어요. 어떤 약을 언제, 무엇 때문에 먹나요?','They sort their medication. What do they take, when, and for what purpose?','薬を整理しています。何を、いつ、何のために飲みますか？']),
 form('profile-hospital','hospital','🏥',['병원 방문 일정을 확인해요. 어느 진료과에 어떤 일로 다니나요?','They check their medical appointments. Which departments do they visit, and why?','通院予定を確認します。何科に、どんな目的で通っていますか？']),
 form('profile-checkup','checkup','📋',['건강검진 문진표를 작성해요. 신체정보부터 건강 상태, 병원과 복용약까지 차례로 골라 주세요.','They complete a checkup questionnaire. Choose their body information, health conditions, medical visits and medication.','健診の問診票を記入します。身体情報、健康状態、通院、服薬を順に選んでください。'])
);
for(const [id,kind] of [['profile-height','height'],['profile-weight','weight']]){const i=PROFILE_EVENTS.findIndex(q=>q.id===id);PROFILE_EVENTS[i]=form(id,kind,kind==='height'?'📏':'⚖️',kind==='height'?['내 키를 어떻게 적을까요? 대략적인 느낌을 고르거나 숫자로 적을 수 있어요.','How would they describe their height? Choose a general impression or enter a number.','身長をどう書きますか？大まかな印象を選ぶか、数値を入力できます。']:['내 체형이나 몸무게를 적어요. 체형을 고르거나 몸무게를 숫자로 적을 수 있어요.','Describe their build or enter their weight as a number.','体型を選ぶか、体重を数値で入力できます。']);}
const genderQuestion=PROFILE_EVENTS.find(q=>q.id==='profile-gender-intro');genderQuestion.icon='📓';genderQuestion.animation='ponder';genderQuestion.question=tri('혼자 보는 기록장에 나를 적어 두어요. 내 성별은 [선택]이에요.','They write about themself in a private journal. Their gender is [select].','自分だけが読むノートに記します。性別は[選択]です。');
PROFILE_EVENTS.find(q=>q.id==='profile-gender-card').question=tri('나를 설명하는 기록을 혼자 살펴봐요. 성별은 [선택]으로 적어 둘게요.','They review a private description of themself. Their gender is recorded as [select].','自分についての記録を一人で確認します。性別は[選択]と記します。');
PROFILE_EVENTS.find(q=>q.id==='profile-hair-texture').question=tri('머리를 빗으며 평소 곱슬기를 살펴봐요. 내 머리는 [선택]이에요.','While combing their hair, they consider its natural texture. It is [select].','髪をとかしながら普段のくせを確かめます。髪は[選択]です。');
const tattoo=PROFILE_EVENTS.find(q=>q.id==='profile-tattoo-encounter');tattoo.animation='ponder';tattoo.choices[2].effects={};tattoo.choices[2].preference='dislikedAttractionTraits';tattoo.choices[4].effects={};tattoo.choices[4].preference='attractionTraits';
export const PROFILE_FIELDS=[...new Set(PROFILE_EVENTS.flatMap(q=>q.fields|| (q.field?[q.field]:q.choices.flatMap(c=>c.tattoo?['bodyProfile.tattoos']:c.preference?['attractionTraits','dislikedAttractionTraits']:[]))))];
export const profileValue=(c,path)=>path.split('.').reduce((v,k)=>v?.[k],c);
