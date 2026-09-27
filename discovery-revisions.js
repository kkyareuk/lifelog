import {DISCOVERY_TRAITS} from './discovery-traits.js?v=20260909dev305';
const tri=(ko,en,ja)=>({ko,en,ja});
const action=(ko,en,ja,targets={},extra={})=>({text:tri(ko,en,ja),effects:{},targets:{...Object.fromEntries(Object.keys(DISCOVERY_TRAITS).map(k=>[k,null])),...targets},...extra});
// Reviewed against weekly feedback through 2026-09-27. Reports are not usage rates.
// Keep distinct motives; merge repeated actions and avoid inventing backstory.
export function refineDiscoveryChoices(events){
 const revise=(id,build)=>{const q=events.find(q=>q.id===id);if(!q)throw Error('Missing discovery question: '+id);q.choices=build(q.choices);q.choiceRevision=506;return q;};
 revise('dilemma-last-dessert',c=>[
  action('남의 케이크에는 손대지 않고 내 볼일을 본다','Leave the cake alone and get on with their day','他人のケーキには触れず、自分の用事を済ませる',{interference:25}),c[0],
  action('몰래 먹고 들키지 않도록 흔적을 정리한다','Eat it secretly and hide the evidence','こっそり食べ、ばれないよう痕跡を片づける',{morality:12,planningStyle:75}),
  action('상하지 않도록 덮개를 씌워 둔다','Cover it to keep it fresh','傷まないようカバーをかけておく',{diligence:70,decisionStyle:70}),c[4]]);
 revise('dilemma-credit',c=>[c[0],
  action('별다른 불만 없이 함께 축하한다','Join in congratulating them without resentment','特に不満はなく、一緒に祝う',{moodPersistence:25}),
  action('서운하지만 지금은 말하지 않는다','Feel hurt but say nothing for now','寂しく思うが、今は何も言わない',{emotionalSensitivity:70,moodPersistence:70}),c[1],c[2]]);
 revise('dilemma-queue-gap',c=>[
  action('내 차례가 올 때까지 그대로 기다린다','Stay in place and wait their turn','自分の番が来るまでそのまま待つ',{impulseControl:20}),
  action('빈자리에 서도 되는지 앞사람에게 묻는다','Ask whether the empty space is available','空いた場所に並んでよいか前の人に尋ねる',{interference:60}),
  action('일행인 척 끼어들고 항의해도 모른 척한다','Cut in as if joining a friend and ignore objections','連れのふりで割り込み、文句を言われても知らん顔をする',{morality:10,planningStyle:70}),c[3],
  action('기다리는 동안 옆 사람에게 말을 건다','Chat with someone nearby while waiting','待つ間、近くの人に話しかける',{socialStyle:75})]);
 revise('cat',c=>[c[0],c[1],c[2],
  action('털이 묻지 않도록 조금 거리를 둔다','Keep a little distance to avoid getting fur on their clothes','毛が付かないよう少し距離を取る',{neatness:75}),
  action('특별히 관심을 두지 않고 하던 일을 한다','Take no particular interest and continue what they were doing','特に気にせず、していたことを続ける',{interference:20})]);
 revise('silence',c=>[
  action('누군가 다시 말할 때까지 편하게 기다린다','Wait comfortably until someone speaks again','誰かがまた話すまで気楽に待つ',{socialStyle:30}),c[1],c[3],
  action('내 말에 문제가 있었나 되짚어 본다','Wonder whether something they said caused the pause','自分の言葉に問題があったのか振り返る',{emotionalSensitivity:75,moodPersistence:65}),c[5]]);
 revise('coin',c=>[c[0],c[1],c[2],
  action('동전에는 손대지 않고 지나간다','Walk past without touching the coin','硬貨には触らず通り過ぎる',{interference:20}),c[5]]);
 revise('parcel',c=>[c[0],c[1],c[2],
  action('신경 쓰지 않고 그대로 지나간다','Leave it as it is and walk on','気にせず、そのまま通り過ぎる',{interference:20}),
  action('주변을 살피고 몰래 가져간다','Check their surroundings and secretly take it','周囲を確かめてこっそり持ち去る',{morality:10,planningStyle:70})]);
 revise('spill',c=>[c[0],c[1],
  action('놀라 잠시 멈춘 뒤 내 물건을 확인한다','Pause in surprise, then check their belongings','驚いて少し止まり、自分の物を確かめる',{emotionalSensitivity:65}),
  action('조심하라고 툴툴대면서도 같이 닦는다','Grumble that they should be careful, but help clean up','気をつけてとぼやきながらも、一緒に拭く',{emotionalExpression:65,diligence:65}),c[7]]);
 const noise=revise('noise',c=>[action('잠깐 살핀 뒤 별일 아니면 하던 일을 한다','Glance over, then carry on if nothing is wrong','少し様子を見て、何もなければしていたことを続ける',{moodPersistence:25}),c[1],c[2],c[3],c[4]]);
 noise.question=tri('갑작스러운 소리나 움직임에 주변 사람들이 놀랐어요.','People nearby are startled by a sudden sound or movement.','突然の音や動きに、周りの人が驚きました。');
 revise('queue',c=>[c[1],c[2],c[3],c[4],c[6]]);
 revise('newtable',c=>[c[0],c[1],action('익숙한 배치로 다시 돌려놓는다','Restore the familiar arrangement','慣れた配置に戻す',{planningStyle:75,interference:65}),c[3],c[4]]);
 // These extras referred to name tags / switching a working lamp off, not the question.
 revise('tag',c=>[c[0],c[1],c[2],c[3],action('실밥은 신경 쓰지 않고 약속에 간다','Ignore the loose thread and leave for the appointment','糸くずは気にせず、約束に向かう',{neatness:25})]);
 revise('lamp',c=>c.slice(0,5));
 revise('profile-hobby-free-hour',c=>[...c,action('아무것도 하지 않고 쉬거나 잠깐 눈을 붙인다','Do nothing for a while, rest, or take a short nap','何もせず休んだり、少しうたた寝したりする',{}, {alwaysOffer:true})]);
 const skill=revise('profile-skill-help',c=>[...c,action('자신 있는 기술은 없어 지시받은 간단한 일을 돕는다','Help with a simple assigned task rather than claim a skill','得意な技術はないので、頼まれた簡単な作業を手伝う',{}, {alwaysOffer:true})]);
 skill.question=tri('행사 준비가 꼬였어요. 어떤 일을 맡을까요?','Event preparations are going wrong. What do they take on?','催しの準備が混乱しています。どんな仕事を引き受けますか？');
 revise('profile-disliked-drink',c=>[...c,action('딱히 싫어하는 음료는 없다','There is no particular drink they dislike','特に苦手な飲み物はない',{}, {alwaysOffer:true})]);
 revise('profile-tattoo-encounter',c=>[c[0],c[1],c[2],
  action('특별한 감상 없이 지나간다','Pass by without a particular impression','特に感想はなく通り過ぎる'),
  action('내게 타투가 있는지와 상관없이 문양이 멋지다고 생각한다','Admire the design regardless of whether they have tattoos','自分にタトゥーがあるかに関係なく、模様が素敵だと思う')]);
}
