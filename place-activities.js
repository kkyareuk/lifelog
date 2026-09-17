// Place menus and their validated task definitions share one catalog on client/server.
const task=(id,labels,desc)=>({id,kind:'rest',room:'living',minutes:30,labels,copy:Object.fromEntries(['ko','en','ja'].map((l,i)=>[l,{title:labels[i],desc:desc[i]}]))});
const meal=(id,labels,descriptions)=>({...task(id,labels,descriptions),kind:'meal',room:'kitchen'});
export const PLACE_TASKS=[
 meal('restaurant_favorite',['좋아하는 음식 주문하기','Order a favorite dish','好きな料理を注文'],['음식점에서 평소 좋아하는 음식을 주문해 즐기고 있어요.','They ordered a favorite dish and are enjoying their meal at the restaurant.','飲食店でいつもの好きな料理を注文して楽しんでいます。']),
 meal('restaurant_spicy',['매운 음식 주문하기','Order a spicy dish','辛い料理を注文'],['음식점에서 매운 음식을 주문해 한입씩 맛보고 있어요.','They ordered a spicy dish at the restaurant and are tasting it one bite at a time.','飲食店で辛い料理を注文し、一口ずつ味わっています。']),
 meal('restaurant_taste',['취향에 맞는 음식 주문하기','Order a dish to suit their tastes','好みに合う料理を注文'],['음식점 메뉴에서 취향에 맞는 음식을 골라 식사하고 있어요.','They picked a dish from the restaurant menu to suit their tastes and are eating it.','飲食店のメニューから好みに合う料理を選んで食事しています。']),
 task('cafe_favorite',['좋아하는 음료 주문하기','Order a favorite drink','好きな飲み物を注文'],['카페에서 평소 좋아하는 음료를 주문해 맛보고 있어요.','They are enjoying their usual favorite drink at the cafe.','カフェでいつもの好きな飲み物を楽しんでいます。']),
 task('cafe_new',['새로운 음료 주문하기','Try a new drink','新しい飲み物を注文'],['카페에서 처음 보는 음료를 주문해 맛을 살펴보고 있어요.','They are tasting a new drink at the cafe.','カフェで初めての飲み物を味わっています。']),
 task('venue_performance',['오늘의 공연 감상하기',"Watch today's performance",'今日の公演を鑑賞'],['공연장에서 오늘의 무대를 감상하고 있어요.','They are watching the performance at the venue.','会場で今日の公演を鑑賞しています。'])
];
export function placeActions(place={}){
 const label=(ko,en,ja)=>({ko,en,ja}),text=[place.type,place.kind,place.name].join(' '),ids=/카페|cafe|coffee|喫茶/i.test(text)?['cafe_favorite','cafe_new']:/공연|극장|concert|theater|theatre|venue|公演/i.test(text)?['venue_performance']:/음식점|식당|레스토랑|분식|한식|중식|일식|양식|restaurant|diner|食堂|レストラン|飲食店/i.test(text)?['restaurant_favorite','restaurant_spicy','restaurant_taste']:[];
 return [...PLACE_TASKS.filter(t=>ids.includes(t.id)).map(t=>({kind:t.kind,lifeTask:t.id,label:label(...t.labels)})),{kind:'walk',label:label('방문하기','Visit','訪れる')},{kind:'hangout',companion:true,label:label('함께 갈 사람 고르기','Choose who to go with','一緒に行く相手を選ぶ')},{kind:'rest',label:label('여기서 쉬기','Rest here','ここで休む')}];
}
