export const CONVERSATION_SUBJECTS=[
 [
  "오늘 하루",
  "Today",
  "今日一日",
  "오늘 가장 기억에 남은 순간",
  "the moment that stood out today",
  "今日一番印象に残った瞬間"
 ],
 [
  "쉬는 날",
  "Days off",
  "休日",
  "아무 약속 없는 날 보내는 방법",
  "how to spend a day with no plans",
  "予定のない日の過ごし方"
 ],
 [
  "식사",
  "Meals",
  "食事",
  "간단히 먹을 때도 포기하기 싫은 한 가지",
  "one thing worth keeping even in a quick meal",
  "手軽な食事でも譲りたくないこと"
 ],
 [
  "날씨",
  "Weather",
  "天気",
  "비 오는 날 바뀌는 하루 계획",
  "how rain changes the day’s plans",
  "雨の日に変わる一日の予定"
 ],
 [
  "동네",
  "The neighborhood",
  "近所",
  "자주 지나는 길에서 달라진 풍경",
  "something different along a familiar route",
  "いつもの道で変わった景色"
 ],
 [
  "잠들기 전",
  "Bedtime",
  "寝る前",
  "잠들기 전 생각을 정리하는 방법",
  "how to clear one’s mind before sleep",
  "眠る前に考えを整理する方法"
 ],
 [
  "작은 습관",
  "Small habits",
  "小さな習慣",
  "계속 유지하고 싶은 사소한 습관",
  "a small habit worth keeping",
  "続けていきたい小さな習慣"
 ],
 [
  "휴식",
  "Rest",
  "休憩",
  "혼자 쉬기와 함께 쉬기의 차이",
  "the difference between resting alone and together",
  "一人で休むことと一緒に休むことの違い"
 ],
 [
  "약속",
  "Plans with others",
  "約束",
  "약속이 갑자기 바뀔 때 미리 알려 줄 내용",
  "what to say when plans suddenly change",
  "予定が急に変わった時に伝えておくこと"
 ],
 [
  "일",
  "Work",
  "仕事",
  "하던 일을 어디서 멈추고 쉴지",
  "where to pause a task and take a break",
  "作業をどこで区切って休むか"
 ],
 [
  "공부",
  "Learning",
  "勉強",
  "모르는 것을 물을 때 먼저 정리할 내용",
  "what to work out before asking a question",
  "分からないことを聞く前に整理しておくこと"
 ],
 [
  "물건 정리",
  "Tidying belongings",
  "物の整理",
  "버릴지 남길지 망설이게 되는 기준",
  "what makes something hard to keep or discard",
  "捨てるか残すか迷う時の基準"
 ],
 [
  "추억",
  "Memories",
  "思い出",
  "같은 일을 서로 다르게 기억하는 이유",
  "why two people remember the same event differently",
  "同じ出来事を違って覚えている理由"
 ],
 [
  "선물",
  "Gifts",
  "贈り物",
  "값보다 상대에게 잘 맞는 선물을 고르는 기준",
  "how to choose a fitting gift beyond its price",
  "値段より相手に合う贈り物の選び方"
 ],
 [
  "대화",
  "Conversation",
  "会話",
  "말을 끊지 않고 질문할 타이밍",
  "when to ask a question without interrupting",
  "話を遮らずに質問するタイミング"
 ],
 [
  "새로운 일",
  "Trying something new",
  "新しいこと",
  "익숙하지 않은 일을 시작할 때 필요한 준비",
  "what helps when starting an unfamiliar task",
  "慣れないことを始める時に必要な準備"
 ],
 [
  "고민",
  "Worries",
  "悩み",
  "해답이 필요한지 먼저 들어주길 바라는지",
  "whether advice or a listening ear is needed",
  "答えが必要なのか、まず聞いてほしいのか"
 ],
 [
  "시간",
  "Time",
  "時間",
  "여유 시간이 생기면 먼저 하고 싶은 일",
  "what comes first when there is spare time",
  "時間に余裕ができたら最初にしたいこと"
 ]
];
export function conversationSubject(value,language="ko"){const i={ko:0,en:1,ja:2}[language]??0,row=CONVERSATION_SUBJECTS.find(row=>row.slice(0,3).includes(value));return row?{name:row[i],detail:row[3+i]}:{name:value,detail:value}}
