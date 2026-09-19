export function isDrinkingCoffee(scene){
 return scene?.coffeeRecovery===true||/커피.{0,15}마시|마시.{0,15}커피|drinking.{0,15}coffee|coffee.{0,15}drinking|コーヒーを飲/i.test([scene?.title,scene?.baseTitle].join(' '));
}
export const coffeeCopy=['커피를 마시며 잠을 깨는 중','따뜻한 커피를 마시며 졸음을 덜고 있어요.','Waking up with coffee','Drinking warm coffee to feel more alert.','コーヒーで目を覚ましているところ','温かいコーヒーを飲んで眠気を和らげています。'];
